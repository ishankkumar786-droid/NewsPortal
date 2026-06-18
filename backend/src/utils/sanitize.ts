import xss from 'xss';

/**
 * Sanitize a string to prevent XSS attacks
 */
export const sanitizeString = (input: string): string => {
  return xss(input, {
    whiteList: {}, // No HTML tags allowed in plain text fields
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
};

/**
 * Sanitize rich HTML content (from Tiptap editor)
 * Allows safe HTML tags but removes dangerous ones
 */
export const sanitizeHtml = (input: string): string => {
  return xss(input, {
    whiteList: {
      a: ['href', 'title', 'target', 'rel'],
      b: [],
      blockquote: ['cite'],
      br: [],
      caption: [],
      cite: [],
      code: [],
      col: ['span', 'width'],
      colgroup: ['span', 'width'],
      dd: [],
      del: [],
      details: ['open'],
      div: ['class'],
      dl: [],
      dt: [],
      em: [],
      figcaption: [],
      figure: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      hr: [],
      i: [],
      img: ['src', 'alt', 'title', 'width', 'height'],
      ins: [],
      li: [],
      mark: [],
      ol: [],
      p: [],
      pre: [],
      s: [],
      section: [],
      small: [],
      span: ['class'],
      strong: [],
      sub: [],
      summary: [],
      sup: [],
      table: ['width', 'border', 'align', 'valign'],
      tbody: ['align', 'valign'],
      td: ['width', 'rowspan', 'colspan', 'align', 'valign'],
      tfoot: ['align', 'valign'],
      th: ['width', 'rowspan', 'colspan', 'align', 'valign'],
      thead: ['align', 'valign'],
      tr: ['rowspan', 'align', 'valign'],
      tt: [],
      u: [],
      ul: [],
      video: ['src', 'controls', 'width', 'height'],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'iframe'],
  });
};

/**
 * Sanitize an object's string fields recursively
 */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      );
    }
  }

  return sanitized;
};
