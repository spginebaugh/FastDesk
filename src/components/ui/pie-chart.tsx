import { PieChart as RechartsChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  width?: number
  height?: number
}

interface CustomLabelProps {
  name: string
  percent: number
}

export function PieChart({ data, width = 400, height = 300 }: PieChartProps) {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer>
        <RechartsChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }: CustomLabelProps) => `${name} ${(percent * 100).toFixed(0)}%`}
            strokeWidth={2}
            stroke="#1a1a1a"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{
                  filter: `drop-shadow(0 0 8px ${entry.color})`,
                  opacity: 0.9
                }}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#fff',
              boxShadow: '0 0 10px #00fff2',
              padding: '8px'
            }}
            itemStyle={{
              color: '#fff'
            }}
            labelStyle={{
              color: '#fff'
            }}
          />
          <Legend 
            formatter={(value: string) => (
              <span 
                style={{ 
                  color: '#fff',
                  textShadow: '0 0 4px #00fff2'
                }}
              >
                {value}
              </span>
            )}
            iconType="circle"
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  )
} 