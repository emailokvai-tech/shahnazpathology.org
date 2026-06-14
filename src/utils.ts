/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Parses markdown-like strings into formatted React nodes.
 * Supports bold, bullet lists, subheadings, and paragraphs.
 */
export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split content by lines
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (inList && listItems.length > 0) {
      elements.push(
        React.createElement(
          'ul',
          { key: `list-${key}`, className: 'list-disc pl-6 my-2 space-y-1 text-gray-700 text-sm' },
          [...listItems]
        )
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check header levels
    if (trimmed.startsWith('###')) {
      flushList(`h3-${index}`);
      const headerText = trimmed.replace('###', '').trim();
      elements.push(
        React.createElement(
          'h4',
          { key: `h3-${index}`, className: 'text-sm font-semibold text-teal-800 mt-4 mb-2 tracking-tight uppercase' },
          parseInlineMarkdown(headerText)
        )
      );
    } else if (trimmed.startsWith('##')) {
      flushList(`h2-${index}`);
      const headerText = trimmed.replace('##', '').trim();
      elements.push(
        React.createElement(
          'h3',
          { key: `h2-${index}`, className: 'text-base font-bold text-gray-900 mt-5 mb-2 tracking-tight border-b border-gray-100 pb-1' },
          parseInlineMarkdown(headerText)
        )
      );
    } else if (trimmed.startsWith('#')) {
      flushList(`h1-${index}`);
      const headerText = trimmed.replace('#', '').trim();
      elements.push(
        React.createElement(
          'h2',
          { key: `h1-${index}`, className: 'text-lg font-bold text-gray-900 mt-6 mb-3 tracking-tight' },
          parseInlineMarkdown(headerText)
        )
      );
    }
    // Check Bullet items
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        inList = true;
      }
      const itemText = trimmed.substring(2).trim();
      listItems.push(
        React.createElement(
          'li',
          { key: `li-${index}`, className: 'text-gray-700 leading-relaxed text-sm' },
          parseInlineMarkdown(itemText)
        )
      );
    }
    // Empty line
    else if (trimmed === '') {
      flushList(`empty-${index}`);
    }
    // Regular paragraph
    else {
      flushList(`para-${index}`);
      elements.push(
        React.createElement(
          'p',
          { key: `p-${index}`, className: 'text-gray-700 leading-relaxed my-2 text-sm' },
          parseInlineMarkdown(trimmed)
        )
      );
    }
  });

  // Flush any final list items
  flushList('final');

  return elements;
}

/**
 * Handles inline formatting like bold text (**bold**)
 */
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return React.createElement(
        'strong',
        { key: `b-${i}`, className: 'font-semibold text-gray-900' },
        part.slice(2, -2)
      );
    }
    return part;
  });
}
