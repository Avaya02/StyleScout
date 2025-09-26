import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { pipeline, RawImage } from '@xenova/transformers';
import dotenv from 'dotenv';
import sizeOf from 'image-size';


// Load environment variables from .env file
dotenv.config();

// --- 1. INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Allow requests from our frontend
const upload = multer({ storage: multer.memoryStorage() }); // Store uploaded images in memory

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is not defined in the .env file.");
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Define which clothing items we want to detect
const RELEVANT_LABELS = ['shirt', 't-shirt', 'pants', 'jeans', 'dress', 'shoe', 'shorts', 'sweater', 'hoodie'];

// --- 2. AI MODEL SETUP ---
// This is a singleton pattern to ensure we only load the models once.
class PipelineSingleton {
  static object_detector_instance: any = null;
  static feature_extractor_instance: any = null;

  static async getObjectDetector() {
    if (this.object_detector_instance === null) {
      console.log("Loading object detection model...");
      this.object_detector_instance = await pipeline('object-detection', 'Xenova/detr-resnet-50');
      console.log("Object detection model loaded.");
    }
    return this.object_detector_instance;
  }

  static async getFeatureExtractor() {
    if (this.feature_extractor_instance === null) {
      console.log("Loading feature extraction model...");
      this.feature_extractor_instance = await pipeline('feature-extraction', 'Xenova/clip-vit-base-patch32');
      console.log("Feature extraction model loaded.");
    }
    return this.feature_extractor_instance;
  }
}

// --- 3. API ENDPOINT ---
app.post('/find-similar-outfits', upload.single('image_file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }
  console.log("Received image upload...");

  try {
    const objectDetector = await PipelineSingleton.getObjectDetector();
    const featureExtractor = await PipelineSingleton.getFeatureExtractor();

    // Step A: Receive and Process Image
    const dimensions = sizeOf(req.file.buffer);
    if (!dimensions.width || !dimensions.height) {
      return res.status(400).json({ message: 'Could not determine image dimensions.' });
    }
    // We now provide the buffer, width, height, and channels (3 for RGB)
    const image = new RawImage(req.file.buffer, dimensions.width, dimensions.height, 3);
    // Step B: Object Detection
    console.log("Running object detection...");
    const detections = await objectDetector(image, {
      threshold: 0.9,
      percentage: true,
    });
    console.log(`Detected ${detections.length} objects.`);
    
    const finalResults: { [key: string]: any[] } = {};

    // Step C: Loop through detected objects
    for (const detection of detections) {
      const { label, box } = detection;
      
      // Only process items we care about
     if (RELEVANT_LABELS.includes(label)) {
        // ... console.log ...

        const originalWidth = image.width;
        const originalHeight = image.height;

        // Convert percentage-based coordinates to absolute pixel coordinates for all 4 corners
        const x_min = box.xmin * originalWidth;
        const y_min = box.ymin * originalHeight;
        const x_max = box.xmax * originalWidth;
        const y_max = box.ymax * originalHeight;
        
        // Crop the image using the four absolute corner coordinates
        const croppedImage = image.crop([x_min, y_min, x_max, y_max]);

        // Step D: Feature Extraction (Get Vector Embedding)
        const embedding = await featureExtractor(croppedImage, {
          pooling: 'mean',
          normalize: true,
        });
        const embeddingVector = Array.from(embedding.data);
        
        // Step E: Database Query
        console.log(`Searching for similar items to "${label}" in the database...`);
        const { data, error } = await supabase.rpc('match_products', {
          query_embedding: embeddingVector,
          match_threshold: 0.85, // How similar items should be (0.0 to 1.0)
          match_count: 4,      // How many results to return
        });

        if (error) {
          console.error(`Database error for ${label}:`, error.message);
          continue; // Move to the next detected item
        }

        if (data && data.length > 0) {
          console.log(`Found ${data.length} matches for ${label}.`);
          // Avoid adding duplicate categories
          if (!finalResults[label]) {
            finalResults[label] = data;
          }
        }
      }
    }

    // Step F: Return Response
    if (Object.keys(finalResults).length === 0) {
      console.log("No relevant clothing items were detected or matched.");
      return res.json({});
    }
    
    console.log("Search complete. Sending results.");
    return res.json(finalResults);

  } catch (error) {
    console.error("An error occurred during processing:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
});


// --- 4. START SERVER ---
app.listen(PORT, () => {
  console.log(`Style Scout server is running on http://localhost:${PORT}`);
  // Eagerly load the models on startup so the first request isn't slow
  PipelineSingleton.getObjectDetector();
  PipelineSingleton.getFeatureExtractor();
});