import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface FormattedContentProps {
  content: string;
  fontSize?: number;
}

export function FormattedContent({ content, fontSize = 14 }: FormattedContentProps) {
  const { colors } = useTheme();

  if (!content) return null;

  // Clean raw LaTeX symbol tags to clean unicode characters
  const cleanMathSymbols = (raw: string): string => {
    return raw
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\leftarrow/g, '←')
      .replace(/\\approx/g, '≈')
      .replace(/\\neq/g, '≠')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\pm/g, '±')
      .replace(/\\infty/g, '∞')
      .replace(/\\theta/g, 'θ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\pi/g, 'π')
      .replace(/\\omega/g, 'ω')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\sin/g, 'sin')
      .replace(/\\cos/g, 'cos')
      .replace(/\\tan/g, 'tan')
      .replace(/\\ln/g, 'ln')
      .replace(/\\log/g, 'log')
      .replace(/\\int/g, '∫')
      .replace(/\\sum/g, '∑')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
      .replace(/\\text\{([^}]+)\}/g, '$1');
  };

  // Helper to render inline segments with bold and math styling
  const renderInlineText = (text: string, baseStyle: any) => {
    // Clean common symbols first
    const cleaned = cleanMathSymbols(text);

    // Regex to split by bold (**text**) or math ($formula$ or `code`)
    const regex = /(\*\*[^*]+\*\*|\$[^$]+\$|`[^`]+`)/g;
    const parts = cleaned.split(regex);

    return (
      <Text style={baseStyle}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const inner = part.slice(2, -2);
            return (
              <Text key={i} style={[baseStyle, styles.bold, { color: colors.text }]}>
                {inner}
              </Text>
            );
          }
          if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1).trim();
            return (
              <Text
                key={i}
                style={[
                  baseStyle,
                  styles.mathPill,
                  { color: colors.primary, backgroundColor: colors.surfaceElevated },
                ]}
              >
                {' '}{math}{' '}
              </Text>
            );
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            const code = part.slice(1, -1);
            return (
              <Text
                key={i}
                style={[
                  baseStyle,
                  styles.codePill,
                  { color: colors.accent, backgroundColor: colors.surfaceElevated },
                ]}
              >
                {code}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  // Split lines into blocks
  const lines = content.split('\n');

  return (
    <View style={styles.container}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={idx} style={styles.spacer} />;
        }

        // Horizontal divider (--- or ***)
        if (trimmed === '---' || trimmed === '***') {
          return (
            <View
              key={idx}
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
          );
        }

        // Header 3 (###) or Header 2 (##) or Header 1 (#)
        if (trimmed.startsWith('#')) {
          const headerLevel = trimmed.match(/^#+/)?.[0].length || 1;
          const headerText = trimmed.replace(/^#+\s*/, '');
          const isH1 = headerLevel === 1;
          const isH2 = headerLevel === 2;

          return (
            <View key={idx} style={styles.headerBlock}>
              <View
                style={[
                  styles.headerAccentBar,
                  { backgroundColor: isH1 ? colors.primary : colors.accent },
                ]}
              />
              {renderInlineText(headerText, [
                styles.headerText,
                {
                  fontSize: isH1 ? fontSize + 4 : isH2 ? fontSize + 2 : fontSize + 1,
                  color: colors.text,
                },
              ])}
            </View>
          );
        }

        // Blockquote (> Text)
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/, '');
          return (
            <View
              key={idx}
              style={[
                styles.quoteBlock,
                {
                  borderLeftColor: colors.primary,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
            >
              {renderInlineText(quoteText, [
                styles.quoteText,
                { fontSize, color: colors.textSecondary },
              ])}
            </View>
          );
        }

        // Bullet list item (* or -)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const itemText = trimmed.replace(/^[*|-]\s+/, '');
          return (
            <View key={idx} style={styles.listRow}>
              <View style={[styles.listBullet, { backgroundColor: colors.primary }]} />
              <View style={styles.listTextContainer}>
                {renderInlineText(itemText, [
                  styles.paragraph,
                  { fontSize, color: colors.textSecondary },
                ])}
              </View>
            </View>
          );
        }

        // Numbered list item (e.g. "1. ")
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const itemText = numberedMatch[2];
          return (
            <View key={idx} style={styles.listRow}>
              <View
                style={[
                  styles.numberBadge,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.numberText, { color: colors.primary }]}>
                  {num}
                </Text>
              </View>
              <View style={styles.listTextContainer}>
                {renderInlineText(itemText, [
                  styles.paragraph,
                  { fontSize, color: colors.textSecondary },
                ])}
              </View>
            </View>
          );
        }

        // Regular paragraph
        return (
          <View key={idx} style={styles.paragraphContainer}>
            {renderInlineText(trimmed, [
              styles.paragraph,
              { fontSize, color: colors.textSecondary },
            ])}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  spacer: {
    height: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  headerAccentBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  headerText: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  quoteBlock: {
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  quoteText: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  numberText: {
    fontSize: 10,
    fontWeight: '800',
  },
  listTextContainer: {
    flex: 1,
  },
  paragraphContainer: {
    marginVertical: 2,
  },
  paragraph: {
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
  },
  mathPill: {
    fontFamily: 'monospace',
    fontWeight: '600',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  codePill: {
    fontFamily: 'monospace',
    fontSize: 12,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
});

