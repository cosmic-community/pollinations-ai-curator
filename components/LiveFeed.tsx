// ...
          eventSource.onmessage = (event) => {
            try {
              const imageData = JSON.parse(event.data);
              // Validate essential fields from stream
              if (imageData && imageData.imageURL) {
                setImages((prev) => {
                  // Keep only last 50 images to prevent memory issues
                  const newImages = [imageData, ...prev];
                  return newImages.slice(0, 50);
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data', e);
            }
          };
// ...