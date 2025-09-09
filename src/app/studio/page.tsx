'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectManager } from '@/lib/project-manager';
import appConfig from '@/app/config/app-config.json';

export default function StudioPage() {
  const router = useRouter();

  // Create a new project and redirect to it
  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const userId = appConfig.admin.user_id;
        const newProject = await ProjectManager.createProject(
          userId,
          'Untitled Project',
          undefined,
          {
            currentModel: 'FLUX.1-Kontext-pro',
            currentSize: '1024x1024',
            isInpaintMode: false,
          },
          {
            currentImage: null,
            generatedImage: null,
            attachedImage: null,
          }
        );

        // Redirect to the new project
        router.push(`/studio/${newProject.id}`);
      } catch (error) {
        console.error('Failed to create new project:', error);
        // Fallback: redirect to a generic studio page
        router.push('/studio/new');
      }
    };

    createAndRedirect();
  }, [router]);

  return null; // This component just redirects
}
