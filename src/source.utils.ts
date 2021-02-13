import { Position, Range } from 'coc.nvim';
import { ASTNode, getLocation, Source, SourceLocation } from 'graphql';

export function positionFromSourceLocation(source: Source, location: SourceLocation) {
  const line = (source.locationOffset ? source.locationOffset.line - 1 : 0) + location.line;
  const column =
    (source.locationOffset && location.line === 1 ? source.locationOffset.column - 1 : 0) + location.column - 1;
  return Position.create(line >= 0 ? line : 0, column >= 0 ? column : 0);
}

export function rangeForASTNode(node: ASTNode): Range {
  const location = node.loc!;
  const source = location.source;
  console.error('source location: ', source);

  return Range.create(
    positionFromSourceLocation(source, getLocation(source, location.start)),
    positionFromSourceLocation(source, getLocation(source, location.end))
  );
}
