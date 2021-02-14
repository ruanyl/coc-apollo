import { parseDocument } from 'graphql-language-service-server';
import { parse, Source, TypeInfo, visit, visitWithTypeInfo, GraphQLSchema } from 'graphql';
import { FieldStats } from './reloadFieldStats';
import { formatMS } from './formatMS';
import { rangeForASTNode } from './source.utils';
import { Range } from 'coc.nvim';

export function stringToAST(text: string, uri: string) {
  const contents = parseDocument(text, uri);

  return contents.map((c) =>
    parse(new Source(c.query, uri, { line: c.range?.start.line ?? 0, column: c.range?.start.character ?? 0 }))
  );
}

interface Decoration {
  document: string;
  message: string;
  range: Range;
  field: string;
}

export function generateDecorations(text: string, uri: string, schema: GraphQLSchema, fieldStats: FieldStats) {
  const astOfDocument = stringToAST(text, uri);

  const decorations: Decoration[] = [];
  for (const ast of astOfDocument) {
    const typeInfo = new TypeInfo(schema);
    visit(
      ast,
      visitWithTypeInfo(typeInfo, {
        enter: (node) => {
          if (node.kind == 'Field' && typeInfo.getParentType()) {
            const parentName = typeInfo.getParentType()!.name;
            const parentEngineStat = fieldStats.get(parentName);
            const engineStat = parentEngineStat ? parentEngineStat.get(node.name.value) : undefined;
            if (engineStat && engineStat > 1) {
              decorations.push({
                document: uri,
                message: `~${formatMS(engineStat, 0)}`,
                range: rangeForASTNode(node),
                field: node.name.value,
              });
            }
          }
        },
      })
    );
  }
  return decorations;
}
