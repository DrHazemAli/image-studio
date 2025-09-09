"use client";

import React from "react";

interface JsonColorizerProps {
  data: unknown;
  theme: "light" | "dark";
  className?: string;
}

// Color schemes for different themes
const lightColors = {
  key: "#d73a49",
  string: "#032f62",
  number: "#005cc5",
  boolean: "#e36209",
  null: "#6f42c1",
  bracket: "#24292e",
  background: "#f6f8fa",
  border: "#e1e4e8",
};

const darkColors = {
  key: "#ff7b72",
  string: "#a5d6ff",
  number: "#79c0ff",
  boolean: "#ffa657",
  null: "#d2a8ff",
  bracket: "#f0f6fc",
  background: "#0d1117",
  border: "#30363d",
};

export function JsonColorizer({
  data,
  theme,
  className = "",
}: JsonColorizerProps) {
  const colors = theme === "dark" ? darkColors : lightColors;

  const formatValue = (value: unknown, depth = 0): React.ReactNode => {
    const indent = "  ".repeat(depth);

    if (value === null) {
      return <span style={{ color: colors.null }}>null</span>;
    }

    if (typeof value === "boolean") {
      return <span style={{ color: colors.boolean }}>{String(value)}</span>;
    }

    if (typeof value === "number") {
      return <span style={{ color: colors.number }}>{value}</span>;
    }

    if (typeof value === "string") {
      return <span style={{ color: colors.string }}>&quot;{value}&quot;</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span style={{ color: colors.bracket }}>[]</span>;
      }

      return (
        <span style={{ color: colors.bracket }}>
          [<br />
          {value.map((item, index) => (
            <React.Fragment key={index}>
              {indent} {formatValue(item, depth + 1)}
              {index < value.length - 1 ? "," : ""}
              <br />
            </React.Fragment>
          ))}
          {indent}]
        </span>
      );
    }

    if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span style={{ color: colors.bracket }}>{}</span>;
      }

      return (
        <span style={{ color: colors.bracket }}>
          {"{"}
          <br />
          {entries.map(([key, val], index) => (
            <React.Fragment key={key}>
              {indent}{" "}
              <span style={{ color: colors.key }}>&quot;{key}&quot;</span>
              <span style={{ color: colors.bracket }}>: </span>
              {formatValue(val, depth + 1)}
              {index < entries.length - 1 ? "," : ""}
              <br />
            </React.Fragment>
          ))}
          {indent}
          {"}"}
        </span>
      );
    }

    return (
      <span style={{ color: colors.string }}>&quot;{String(value)}&quot;</span>
    );
  };

  return (
    <pre
      className={`text-xs p-3 rounded overflow-x-auto max-h-96 font-mono leading-relaxed ${className}`}
      style={{
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
        color: colors.bracket,
      }}
    >
      {formatValue(data)}
    </pre>
  );
}

// Simple JSON string formatter for basic cases
export function formatJsonString(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
