import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onSearch: (file: File) => void;
  isLoading: boolean;
}

export function ImageUploader({ onSearch, isLoading }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: false,
  });

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSearchClick = () => {
    if (file) {
      onSearch(file);
    }
  };

  return (
    <Card className="w-full max-w-lg bg-gray-900/50 border-gray-800">
      <CardContent className="p-6">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Image preview" className="max-h-80 w-auto object-contain rounded-md mx-auto" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full h-8 w-8"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-700 hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-center text-muted-foreground">
              {isDragActive ? 'Drop the file here...' : "Drag 'n' drop an image, or click to select"}
            </p>
            <p className="text-xs text-gray-600 mt-1">PNG, JPG, JPEG</p>
          </div>
        )}
        <Button
          className="w-full mt-6"
          onClick={handleSearchClick}
          disabled={!file || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isLoading ? 'Scouting for styles...' : 'Scout for Similar Styles'}
        </Button>
      </CardContent>
    </Card>
  );
}