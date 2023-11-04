import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2'; 
import Chart from 'chart.js/auto'; 

function Analytics() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Books Borrowed',
        data: [],
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    // Fetch data from the /borrowed-books-data endpoint
    fetch('http://localhost:3001/borrowed-books-data')
      .then((response) => response.json())
      .then((data) => {
        // Extract dates and book counts from the data
        const labels = data.map((entry) => entry.BorrowDate);
        const booksBorrowed = data.map((entry) => entry.BooksBorrowed);

        // Update the chartData state with the retrieved data
        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Books Borrowed',
              data: booksBorrowed,
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
            },
          ],
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="analytics">
      <h2>Books Borrowed in the Last 30 Days</h2>
      <Line data={chartData} options={{ responsive: true }} />
    </div>
  );
}

export default Analytics;