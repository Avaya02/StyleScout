import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { Toaster, toast } from 'sonner';
import type { ApiResponse } from './lib/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import type { ResultsDisplayProps } from './lib/types';



function App() {
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSearch = async (file: File) => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }
    setIsLoading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('image_file', file);

    try {
      // The backend will run on port 3001
      const response = await fetch('http://localhost:3001/find-similar-outfits', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }

      const data: ApiResponse = await response.json();
      
      if (Object.keys(data).length === 0) {
        setResults({}); // Set to empty object to indicate "not found"
        toast.info('No clothing items could be detected in the image.');
      } else {
        setResults(data);
        toast.success('Found some stylish matches for you!');
      }

    } catch (error: any) {
      console.error('Error fetching results:', error);
      toast.error(error.message || 'Something went wrong. Please try another image.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Snap, Scout, Shop.
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                See an outfit you love? Upload a photo, and let our AI find similar styles for you to shop instantly.
              </p>
              <ImageUploader onSearch={handleSearch} isLoading={isLoading} setImagePreview={setImagePreview} />
            </div>
            <div>
              <ResultsDisplay results={results} isLoading={isLoading} imagePreview={imagePreview} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
