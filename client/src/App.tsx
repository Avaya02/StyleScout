import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { Toaster, toast } from 'sonner';
import type { ApiResponse } from './lib/types';


function App() {
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      if (Object.keys(data).length === 0 || (data.message && Object.keys(data).length === 1)) {
        setResults({}); // Set to empty object to indicate "not found"
        toast.info('No clothing items could be detected in the image.');
      } else {
        setResults(data);
        toast.success('Found some stylish matches for you!');
      }

    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Something went wrong. Please try another image.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen w-full bg-background text-foreground">
        <header className="flex items-center justify-center p-4 border-b border-gray-800">
          <h1 className="text-3xl font-bold tracking-tight">
            Style Scout
          </h1>
        </header>
        <main className="container mx-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
            <p className="text-lg text-muted-foreground mb-8">
              See an outfit you love? Upload a photo, and let our AI find similar styles for you to shop instantly.
            </p>
            <ImageUploader onSearch={handleSearch} isLoading={isLoading} />
          </div>
          <div className="mt-12">
            <ResultsDisplay results={results} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
