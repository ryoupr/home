import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ParsedData } from './csvParser';

interface ReferenceLineConfig {
  id: number;
  value: number;
  label: string;
  color: string;
}

interface ReferenceAreaConfig {
  id: number;
  y1: number;
  y2: number;
  label: string;
  color: string;
}

export type { ReferenceLineConfig, ReferenceAreaConfig };

interface Props {
  chartType: 'bar' | 'line' | 'area';
  data: ParsedData[];
  xAxisKey: string;
  dataKeys: string[];
  colors: string[];
  textColor: string;
  showDataLabels: boolean;
  referenceLines: ReferenceLineConfig[];
  referenceAreas: ReferenceAreaConfig[];
}

const TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  border: 'none',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  color: '#1e293b',
};

const formatValue = (value: unknown) => (value as number).toLocaleString();

export function CsvChart({
  chartType,
  data,
  xAxisKey,
  dataKeys,
  colors,
  textColor,
  showDataLabels,
  referenceLines,
  referenceAreas,
}: Props) {
  const axisProps = {
    stroke: textColor,
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  };

  const refLines = referenceLines.map((line) => (
    <ReferenceLine
      key={line.id}
      y={line.value}
      label={{
        position: 'right' as const,
        value: line.label,
        fill: line.color,
        fontSize: 12,
        fontWeight: 'bold',
      }}
      stroke={line.color}
      strokeDasharray="3 3"
      strokeWidth={2}
    />
  ));

  const refAreas = referenceAreas.map((area) => (
    <ReferenceArea
      key={area.id}
      y1={area.y1}
      y2={area.y2}
      label={{
        position: 'insideTopRight' as const,
        value: area.label,
        fill: '#92400e',
        fontSize: 12,
        fontWeight: 'bold',
      }}
      fill={area.color}
      fillOpacity={0.2}
      strokeOpacity={0}
    />
  ));

  const margin = { top: 10, right: 30, left: 0, bottom: 0 };

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={400}>
      {chartType === 'bar' ? (
        <BarChart data={data} margin={margin}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={textColor}
            strokeOpacity={0.2}
          />
          <XAxis dataKey={xAxisKey} {...axisProps} />
          <YAxis {...axisProps} tickFormatter={formatValue} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatValue} />
          <Legend wrapperStyle={{ color: textColor }} />
          {dataKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[i % colors.length]}
              radius={[4, 4, 0, 0]}
            >
              {showDataLabels && (
                <LabelList
                  dataKey={key}
                  position="top"
                  fill={textColor}
                  fontSize={10}
                />
              )}
            </Bar>
          ))}
          {refAreas}
          {refLines}
        </BarChart>
      ) : chartType === 'line' ? (
        <LineChart data={data} margin={margin}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={textColor}
            strokeOpacity={0.2}
          />
          <XAxis dataKey={xAxisKey} {...axisProps} />
          <YAxis {...axisProps} tickFormatter={formatValue} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatValue} />
          <Legend wrapperStyle={{ color: textColor }} />
          {dataKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            >
              {showDataLabels && (
                <LabelList
                  dataKey={key}
                  position="top"
                  fill={textColor}
                  fontSize={10}
                  offset={10}
                />
              )}
            </Line>
          ))}
          {refAreas}
          {refLines}
        </LineChart>
      ) : (
        <AreaChart data={data} margin={margin}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={textColor}
            strokeOpacity={0.2}
          />
          <XAxis dataKey={xAxisKey} {...axisProps} />
          <YAxis {...axisProps} tickFormatter={formatValue} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatValue} />
          <Legend wrapperStyle={{ color: textColor }} />
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              fill={colors[i % colors.length]}
              stroke={colors[i % colors.length]}
              fillOpacity={0.2}
            >
              {showDataLabels && (
                <LabelList
                  dataKey={key}
                  position="top"
                  fill={textColor}
                  fontSize={10}
                />
              )}
            </Area>
          ))}
          {refAreas}
          {refLines}
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}
