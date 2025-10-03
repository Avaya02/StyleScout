import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, Loader2, Wand2 } from 'lucide-react';

interface ImageUploaderProps {
  onSearch: (file: File) => void;
  isLoading: boolean;
  setImagePreview: (preview: string | null) => void;
}

export function ImageUploader({ onSearch, isLoading, setImagePreview }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [setImagePreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
  });

  const handleRemoveImage = () => {
    setFile(null);
    setImagePreview(null);
  };

  const handleSearchClick = () => {
    if (file) {
      onSearch(file);
    }
  };

  return (
    <Card className="w-full max-w-lg bg-card border shadow-sm">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground font-semibold">
            {isDragActive ? 'Drop the file here...' : "Drag 'n' drop an image"}
          </p>
          <p className="text-sm text-muted-foreground/80 mt-1">or click to select a file</p>
        </div>
        
        {file && (
          <div className="mt-4 text-sm flex items-center justify-between bg-muted p-2 rounded-md">
            <span className="truncate font-medium">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          className="w-full mt-6 text-lg py-6"
          onClick={handleSearchClick}
          disabled={!file || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-5 w-5" />
          )}
          {isLoading ? 'Scouting for styles...' : 'Find Similar Styles'}
        </Button>
      </CardContent>
    </Card>
  );
}

