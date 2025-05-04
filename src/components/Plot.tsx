import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { evaluate } from 'mathjs';
import './Plot.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PlotProps {
  expression: string;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  points?: number;
  title?: string;
  variables?: { [key: string]: any };
  onClose?: () => void;
}

type LineChartData = ChartData<'line', number[]>;
type LineChartOptions = ChartOptions<'line'>;

const Plot: React.FC<PlotProps> = ({
  expression,
  xMin = -10,
  xMax = 10,
  yMin,
  yMax,
  points = 100,
  title = 'Function Plot',
  variables = {},
  onClose,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<LineChartData | null>(null);
  const [chartOptions, setChartOptions] = useState<LineChartOptions | null>(null);

  useEffect(() => {
    try {
      // Generate x values
      const step = (xMax - xMin) / (points - 1);
      const xValues = Array.from({ length: points }, (_, i) => xMin + i * step);
      
      // Calculate y values
      const yValues = xValues.map(x => {
        try {
          // Evaluate the expression with the current x value and variables
          return evaluate(expression, { x, ...variables });
        } catch (err) {
          // Return null for values that can't be calculated
          return null;
        }
      });
      
      // Filter out points where evaluation failed
      const validPoints = xValues.reduce((acc, x, i) => {
        if (yValues[i] !== null && !isNaN(yValues[i]) && isFinite(yValues[i])) {
          acc.x.push(x);
          acc.y.push(yValues[i]);
        }
        return acc;
      }, { x: [] as number[], y: [] as number[] });
      
      // No valid points to plot
      if (validPoints.y.length === 0) {
        setError('No valid points to plot. Check your expression.');
        setChartData(null);
        setChartOptions(null);
        return;
      }
      
      // Auto-calculate y range if not provided
      const calculatedYMin = yMin ?? Math.min(...validPoints.y);
      const calculatedYMax = yMax ?? Math.max(...validPoints.y);
      
      // Prepare chart data
      const data: LineChartData = {
        labels: validPoints.x,
        datasets: [
          {
            label: expression,
            data: validPoints.y,
            borderColor: 'rgb(66, 66, 66)',
            backgroundColor: 'rgba(66, 66, 66, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
          },
        ],
      };
      
      // Chart options
      const options: LineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'x',
            },
            min: xMin,
            max: xMax,
            ticks: {
              callback: function(value) {
                return Number(value).toFixed(2);
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'y',
            },
            min: calculatedYMin,
            max: calculatedYMax,
          },
        },
        plugins: {
          title: {
            display: !!title,
            text: title,
          },
          legend: {
            position: 'top',
          },
        },
      };
      
      setChartData(data);
      setChartOptions(options);
      setError(null);
    } catch (err) {
      setError(`Error plotting expression: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setChartData(null);
      setChartOptions(null);
    }
  }, [expression, xMin, xMax, yMin, yMax, points, title, variables]);

  return (
    <div className="plot-container">
      <div className="plot-header">
        <h3>{title}</h3>
        {onClose && (
          <button className="close-plot-btn" onClick={onClose} aria-label="Close plot">
            ×
          </button>
        )}
      </div>
      
      <div className="plot-content">
        {error ? (
          <div className="plot-error">{error}</div>
        ) : chartData && chartOptions ? (
          <div className="chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="plot-loading">Loading plot...</div>
        )}
      </div>
      
      <div className="plot-controls">
        <div className="plot-info">
          <span>Expression: <code>{expression}</code></span>
          <span>Range: [{xMin}, {xMax}]</span>
        </div>
      </div>
    </div>
  );
};

export default Plot;