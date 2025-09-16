"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flex, Container, Box } from "@radix-ui/themes";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

import { AzureConfig } from "@/types/azure";

interface ConfigResponse {
  config: AzureConfig;
  hasApiKey: boolean;
  configErrors: string[];
  isValid: boolean;
}

export default function Home() {
  const router = useRouter();
  const [config, setConfig] = useState<AzureConfig | null>(null);
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const [showConfigAlert, setShowConfigAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/config");
        const data: ConfigResponse = await response.json();

        setConfig(data.config);

        if (data.configErrors.length > 0) {
          setConfigErrors(data.configErrors);
          // If the config errors indicate no Azure endpoint / API key, open studio
          // and request the settings dialog to be shown so user can configure endpoints.
          const hasAzureKeyError = data.configErrors.some(
            (e) => /azure api key/i.test(e) || /AZURE_API_KEY/i.test(e),
          );
          if (hasAzureKeyError) {
            // Redirect to studio and request settings to open for Azure tab
            router.push("/studio?openSettings=azure");
            return;
          }

          setShowConfigAlert(true);
        } else {
          // Check if there are no properly configured endpoints, even if no errors
          const hasValidEndpoints =
            data.config &&
            data.config.endpoints &&
            data.config.endpoints.some(
              (endpoint) =>
                endpoint.baseUrl &&
                !endpoint.baseUrl.includes("<env.") &&
                endpoint.baseUrl !== "" &&
                endpoint.apiKey &&
                endpoint.apiKey !== "",
            );

          if (!hasValidEndpoints) {
            // No properly configured endpoints - redirect to studio and open settings
            router.push("/studio?openSettings=azure");
            return;
          }

          // If no errors and endpoints are properly configured, redirect to studio
          router.push("/studio");
          return;
        }
      } catch (error) {
        console.error("Failed to load config:", error);
        setConfigErrors(["Failed to load configuration"]);
        setShowConfigAlert(true);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [router]);

  const handleRefresh = () => {
    setLoading(true);
    setConfigErrors([]);
    setShowConfigAlert(false);
    setConfig(null);

    // Reload the configuration
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/config");
        const data: ConfigResponse = await response.json();

        setConfig(data.config);

        if (data.configErrors.length > 0) {
          setConfigErrors(data.configErrors);
          setShowConfigAlert(true);
        } else {
          // If no errors, redirect to studio
          router.push("/studio");
          return;
        }
      } catch (error) {
        console.error("Failed to load config:", error);
        setConfigErrors(["Failed to load configuration"]);
        setShowConfigAlert(true);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  };

  if (loading) {
    return (
      <Container size="2" className="py-8">
        <Flex justify="center" align="center" style={{ minHeight: "50vh" }}>
          <Box>Loading configuration...</Box>
        </Flex>
      </Container>
    );
  }

  if (!config) {
    return (
      <Container size="2" className="py-8">
        <Flex justify="center" align="center" style={{ minHeight: "50vh" }}>
          <Box>Failed to load configuration</Box>
        </Flex>
      </Container>
    );
  }

  return (
    <div className="min-h-screen">
      <AlertDialog.Root
        open={showConfigAlert}
        onOpenChange={setShowConfigAlert}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" />
          <AlertDialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 shadow-2xl duration-200 rounded-2xl border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <AlertDialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                Configuration Issues
              </AlertDialog.Title>
            </div>
            <AlertDialog.Description className="text-sm text-gray-600 dark:text-gray-300">
              The following configuration issues were detected:
              <ul className="mt-3 space-y-2">
                {configErrors.map((error, index) => (
                  <li
                    key={index}
                    className="text-red-600 dark:text-red-400 flex items-start gap-2"
                  >
                    <span className="block w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </AlertDialog.Description>
            <div className="flex justify-end gap-2 pt-2">
              <motion.button
                onClick={handleRefresh}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Refresh
              </motion.button>
              <AlertDialog.Cancel asChild>
                <motion.button
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
