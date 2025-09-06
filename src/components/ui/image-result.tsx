'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Card, Box, Button, Flex, Text, Dialog, AspectRatio } from '@radix-ui/themes';
import Image from 'next/image';
import { ImageGenerationResponse } from '@/types/azure';

interface ImageResultProps {
  result: ImageGenerationResponse | null;
  prompt: string;
}

export function ImageResult({ result, prompt }: ImageResultProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!result || !result.data.length) {
    return null;
  }

  const downloadImage = (base64Data: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = `generated-image-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card>
        <Box p="6">
          <Flex align="center" justify="between" className="mb-4">
            <Box>
              <Text size="4" weight="bold" className="block">
                Generated Images
              </Text>
              <Text size="2" color="gray" className="mt-1 block">
                &ldquo;{prompt}&rdquo;
              </Text>
            </Box>
            <Text size="1" color="gray">
              {result.data.length} image{result.data.length !== 1 ? 's' : ''}
            </Text>
          </Flex>

          <div className="grid gap-4" style={{ 
            gridTemplateColumns: `repeat(${Math.min(result.data.length, 2)}, 1fr)` 
          }}>
            <AnimatePresence>
              {result.data.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                    <AspectRatio ratio={1}>
                      <div 
                        className="relative w-full h-full cursor-pointer"
                        onClick={() => setSelectedImage(`data:image/png;base64,${image.b64_json}`)}
                      >
                        <Image
                          src={`data:image/png;base64,${image.b64_json}`}
                          alt={`Generated image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </AspectRatio>
                    <Box p="3">
                      <Flex gap="2" justify="center">
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => setSelectedImage(`data:image/png;base64,${image.b64_json}`)}
                        >
                          <MagnifyingGlassIcon />
                          View
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => downloadImage(image.b64_json, index)}
                        >
                          <DownloadIcon />
                          Download
                        </Button>
                      </Flex>
                    </Box>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Box>
      </Card>

      <Dialog.Root open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <Dialog.Content maxWidth="90vw" maxHeight="90vh">
          <Dialog.Title>Generated Image</Dialog.Title>
          <Box className="mt-4">
            {selectedImage && (
              <div className="relative w-full max-h-[80vh]">
                <Image
                  src={selectedImage}
                  alt="Generated image full view"
                  width={1024}
                  height={1024}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              </div>
            )}
          </Box>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Close
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </motion.div>
  );
}