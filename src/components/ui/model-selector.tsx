"use client";

import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { Text, Flex, Box } from "@radix-ui/themes";
import { AzureDeployment } from "@/types/azure";

interface ModelSelectorProps {
  deployments: AzureDeployment[];
  selectedDeployment: string;
  onDeploymentChange: (deploymentId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  deployments,
  selectedDeployment,
  onDeploymentChange,
  disabled = false,
}: ModelSelectorProps) {
  const selectedModel = deployments.find((d) => d.id === selectedDeployment);

  return (
    <Box>
      <Text size="2" weight="medium" className="mb-2 block">
        Model
      </Text>
      <Select.Root
        value={selectedDeployment}
        onValueChange={onDeploymentChange}
        disabled={disabled}
      >
        <Select.Trigger className="inline-flex items-center justify-between rounded px-4 py-3 text-sm leading-none h-10 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 data-[placeholder]:text-gray-500 min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed">
          <Select.Value placeholder="Select a model">
            {selectedModel && (
              <Flex direction="column" align="start">
                <Text size="2" weight="medium">
                  {selectedModel.name}
                </Text>
                <Text size="1" color="gray">
                  {selectedModel.maxSize} •{" "}
                  {selectedModel.supportedFormats.join(", ")}
                </Text>
              </Flex>
            )}
          </Select.Value>
          <Select.Icon className="ml-2">
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
              <ChevronUpIcon />
            </Select.ScrollUpButton>

            <Select.Viewport className="p-1">
              {deployments.map((deployment) => (
                <Select.Item
                  key={deployment.id}
                  value={deployment.id}
                  className="text-sm leading-none rounded-sm flex items-center h-auto p-3 relative select-none data-[disabled]:text-gray-400 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 cursor-pointer"
                >
                  <Select.ItemText>
                    <Flex direction="column" align="start" gap="1">
                      <Text size="2" weight="medium">
                        {deployment.name}
                      </Text>
                      <Text size="1" color="gray">
                        Max size: {deployment.maxSize}
                      </Text>
                      <Text size="1" color="gray">
                        Formats: {deployment.supportedFormats.join(", ")}
                      </Text>
                      {deployment.description && (
                        <Text
                          size="1"
                          color="gray"
                          style={{ fontStyle: "italic" }}
                        >
                          {deployment.description}
                        </Text>
                      )}
                    </Flex>
                  </Select.ItemText>
                  <Select.ItemIndicator className="absolute left-2 w-4 h-4 inline-flex items-center justify-center">
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>

            <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </Box>
  );
}
