import * as React from 'react';
import { performance } from 'perf_hooks';
import { render } from '@testing-library/react';
import { getElementComponent } from './element-component';
import { getPlugin, Plugin } from './plugin/plugin';

const PLUGIN_COUNT = 32;
const TABLE_ROWS = 100;
const TABLE_COLUMNS = 10;
const ITERATIONS = 5;

type CellProps = Record<string, number | string | undefined> & {
  className?: string;
};

const createPlugins = (): Plugin<any>[] =>
  Array.from({ length: PLUGIN_COUNT }, (_, index) =>
    getPlugin((props: CellProps) => {
      const propName = `$p${index}`;
      const value = props[propName];

      if (value === undefined) {
        return { [propName]: undefined } as any;
      }

      const className = props.className
        ? `${props.className} ${propName}-${value}`
        : `${propName}-${value}`;

      return { className, [propName]: undefined } as any;
    }),
  );

const plugins = createPlugins();
const ElementCell = getElementComponent('td', ...plugins);

const createCellProps = (seed: number): CellProps => {
  const props: CellProps = { className: 'cell' };

  for (let index = 0; index < PLUGIN_COUNT; index++) {
    props[`$p${index}`] = (seed + index) % 10;
  }

  return props;
};

const rawCellProps = Array.from(
  { length: TABLE_ROWS * TABLE_COLUMNS },
  (_, index) => createCellProps(index),
);

const applyPlugins = (input: CellProps): CellProps => {
  let current = input;
  let didClone = false;

  for (const plugin of plugins) {
    const output = plugin(current as any) as CellProps | undefined;

    if (!output || typeof output !== 'object') {
      continue;
    }

    let hasChange = false;

    for (const key in output) {
      const value = output[key];

      if (value === undefined) {
        if (key in current) {
          hasChange = true;
          break;
        }
      } else if (!Object.is(value, current[key])) {
        hasChange = true;
        break;
      }
    }

    if (!hasChange) {
      continue;
    }

    if (!didClone) {
      current = { ...current };
      didClone = true;
    }

    for (const key in output) {
      const value = output[key];

      if (value === undefined) {
        delete current[key];
      } else {
        current[key] = value;
      }
    }
  }

  return current;
};

const processedCellProps = rawCellProps.map(applyPlugins);

const Table = ({
  Cell,
  cellProps,
}: {
  Cell: React.ComponentType<any>;
  cellProps: CellProps[];
}) => (
  <table>
    <tbody>
      {Array.from({ length: TABLE_ROWS }, (_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: TABLE_COLUMNS }, (_, columnIndex) => {
            const cellIndex = rowIndex * TABLE_COLUMNS + columnIndex;

            return <Cell key={cellIndex} {...cellProps[cellIndex]} />;
          })}
        </tr>
      ))}
    </tbody>
  </table>
);

const measure = (label: string, renderTable: () => void) => {
  const start = performance.now();

  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    renderTable();
  }

  const end = performance.now();
  const duration = end - start;

  console.log(`${label}: ${Math.round(duration * 100) / 100}ms`);

  return duration;
};

const mountRender = (
  Cell: React.ComponentType<any>,
  cellProps: CellProps[],
) => {
  const rendered = render(<Table Cell={Cell} cellProps={cellProps} />);
  rendered.unmount();
};

const updateRender = (
  Cell: React.ComponentType<any>,
  cellProps: CellProps[],
) => {
  const rendered = render(<Table Cell={Cell} cellProps={cellProps} />);
  rendered.rerender(<Table Cell={Cell} cellProps={cellProps} />);
  rendered.unmount();
};

describe('element-component.performance', () => {
  jest.setTimeout(20000);

  it('compares element-component to native table cells', () => {
    const nativeCell = (props: CellProps) => <td {...props} />;

    const nativeMount = measure('native mount', () =>
      mountRender(nativeCell, processedCellProps),
    );
    const elementMount = measure('element-component mount', () =>
      mountRender(ElementCell, rawCellProps),
    );
    const nativeUpdate = measure('native update', () =>
      updateRender(nativeCell, processedCellProps),
    );
    const elementUpdate = measure('element-component update', () =>
      updateRender(ElementCell, rawCellProps),
    );

    const mountRatio = elementMount / nativeMount;
    const updateRatio = elementUpdate / nativeUpdate;

    console.log(`mount ratio: ${Math.round(mountRatio * 100) / 100}`);
    console.log(`update ratio: ${Math.round(updateRatio * 100) / 100}`);

    expect(mountRatio).toBeLessThan(5);
    expect(updateRatio).toBeLessThan(10);
  });
});
