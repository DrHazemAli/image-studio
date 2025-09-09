"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeIcon,
} from "@radix-ui/react-icons";
import {
  Card,
  Box,
  Text,
  Flex,
  Button,
  ScrollArea,
  Badge,
} from "@radix-ui/themes";
import { useTheme } from "@/hooks/use-theme";
import { JsonColorizer } from "@/lib/json-colorizer";

interface ConsoleSidebarProps {
  requestLog: Record<string, unknown> | null;
  responseLog: Record<string, unknown> | null;
  isOpen: boolean;
  onToggle: () => void;
}

export function ConsoleSidebar({
  requestLog,
  responseLog,
  isOpen,
  onToggle,
}: ConsoleSidebarProps) {
  const [activeTab, setActiveTab] = useState<"request" | "response">("request");
  const { resolvedTheme } = useTheme();

  const getStatusColor = (status?: number) => {
    if (!status) return "gray";
    if (status >= 200 && status < 300) return "green";
    if (status >= 400) return "red";
    return "yellow";
  };

  const getStatusVariant = (status?: number) => {
    if (!status) return "soft";
    if (status >= 200 && status < 300) return "solid";
    if (status >= 400) return "solid";
    return "soft";
  };

  return (
    <motion.div
      className="fixed right-0 top-0 h-full z-50"
      animate={{
        x: isOpen ? 0 : 360,
        width: isOpen ? 400 : 40,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className={`h-full  shadow-2xl`} style={{ borderRadius: 0 }}>
        <Flex direction="column" height="100%">
          <Flex
            justify="between"
            align="center"
            p="3"
            className={`border-b border-b-gray-200 dark:border-b-gray-700 `}
          >
            <Flex align="center" gap="2">
              <CodeIcon
                className={
                  resolvedTheme === "dark" ? "text-white" : "text-gray-700"
                }
              />
              <Text
                size="2"
                weight="medium"
                className={
                  resolvedTheme === "dark" ? "text-white" : "text-gray-900"
                }
              >
                Console
              </Text>
            </Flex>
            <Button
              variant="ghost"
              size="1"
              onClick={onToggle}
              className={
                resolvedTheme === "dark"
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }
            >
              {isOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </Button>
          </Flex>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                <div className={``}>
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("request")}
                      className={`console-tab ${
                        activeTab === "request"
                          ? "console-tab-active"
                          : "console-tab-inactive"
                      } ${
                        resolvedTheme === "dark"
                          ? "console-tab-dark"
                          : "console-tab-light"
                      }`}
                    >
                      <span className="console-tab-text">Request</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("response")}
                      className={`console-tab ${
                        activeTab === "response"
                          ? "console-tab-active"
                          : "console-tab-inactive"
                      } ${
                        resolvedTheme === "dark"
                          ? "console-tab-dark"
                          : "console-tab-light"
                      }`}
                    >
                      <span className="console-tab-text">Response</span>
                      {responseLog?.status &&
                      typeof responseLog.status === "number" ? (
                        <Badge
                          color={getStatusColor(Number(responseLog.status))}
                          variant={getStatusVariant(Number(responseLog.status))}
                          size="1"
                          className="ml-2"
                        >
                          {String(responseLog.status)}
                        </Badge>
                      ) : null}
                    </button>
                  </div>
                </div>

                <ScrollArea className={`flex-1 p-3`}>
                  {activeTab === "request" && requestLog && (
                    <Box>
                      <Text
                        size="1"
                        className={`mb-2 block ${
                          resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        {requestLog.timestamp
                          ? String(requestLog.timestamp)
                          : "No timestamp"}
                      </Text>
                      <Box className="space-y-3">
                        <Box>
                          <Text
                            size="1"
                            weight="medium"
                            className={`block mb-1 ${
                              resolvedTheme === "dark"
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            Method & URL
                          </Text>
                          <Text
                            size="1"
                            className={`font-mono break-all ${
                              resolvedTheme === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            {String(requestLog.method)} {String(requestLog.url)}
                          </Text>
                        </Box>

                        <Box>
                          <Text
                            size="1"
                            weight="medium"
                            className={`block mb-1 ${
                              resolvedTheme === "dark"
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            Headers
                          </Text>
                          <JsonColorizer
                            data={requestLog.headers}
                            theme={resolvedTheme}
                          />
                        </Box>

                        <Box>
                          <Text
                            size="1"
                            weight="medium"
                            className={`block mb-1 ${
                              resolvedTheme === "dark"
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            Body
                          </Text>
                          <JsonColorizer
                            data={requestLog.body}
                            theme={resolvedTheme}
                          />
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {activeTab === "response" && responseLog && (
                    <Box>
                      <Text
                        size="1"
                        className={`mb-2 block ${
                          resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        {responseLog.timestamp
                          ? String(responseLog.timestamp)
                          : "No timestamp"}
                      </Text>
                      <Box className="space-y-3">
                        {responseLog.status &&
                        typeof responseLog.status === "number" ? (
                          <Box>
                            <Text
                              size="1"
                              weight="medium"
                              className={`block mb-1 ${
                                resolvedTheme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              Status
                            </Text>
                            <Flex align="center" gap="2">
                              <Badge
                                color={getStatusColor(
                                  Number(responseLog.status),
                                )}
                                variant={getStatusVariant(
                                  Number(responseLog.status),
                                )}
                              >
                                {String(responseLog.status)}
                              </Badge>
                              <Text
                                size="1"
                                className={
                                  resolvedTheme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }
                              >
                                {responseLog.statusText
                                  ? String(responseLog.statusText)
                                  : "No status text"}
                              </Text>
                            </Flex>
                          </Box>
                        ) : null}

                        <Box>
                          <Text
                            size="1"
                            weight="medium"
                            className={`block mb-1 ${
                              resolvedTheme === "dark"
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            Response Body
                          </Text>
                          <JsonColorizer
                            data={responseLog.body}
                            theme={resolvedTheme}
                            className="max-h-96"
                          />
                        </Box>

                        {responseLog.error &&
                        typeof responseLog.error === "string" ? (
                          <Box>
                            <Text
                              size="1"
                              weight="medium"
                              className={`block mb-1 ${
                                resolvedTheme === "dark"
                                  ? "text-red-400"
                                  : "text-red-600"
                              }`}
                            >
                              Error
                            </Text>
                            <Text
                              size="1"
                              className={
                                resolvedTheme === "dark"
                                  ? "text-red-300"
                                  : "text-red-600"
                              }
                            >
                              {responseLog.error
                                ? String(responseLog.error)
                                : "Unknown error"}
                            </Text>
                          </Box>
                        ) : null}
                      </Box>
                    </Box>
                  )}

                  {activeTab === "request" && !requestLog && (
                    <Text
                      size="1"
                      className={`${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                      style={{ fontStyle: "italic" }}
                    >
                      No request data available
                    </Text>
                  )}

                  {activeTab === "response" && !responseLog && (
                    <Text
                      size="1"
                      className={`${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                      style={{ fontStyle: "italic" }}
                    >
                      No response data available
                    </Text>
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </Flex>
      </Card>
    </motion.div>
  );
}
