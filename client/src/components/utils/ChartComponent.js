import React, { Component, createRef } from "react";
import {
    Chart,
    LineElement,
    LineController,
    TimeScale,
    Title,
    Tooltip,
    registerables,
} from "chart.js";
import "chartjs-adapter-date-fns";

class ChartComponent extends Component {
    chartRef = createRef();

    constructor() {
        super();
        Chart.register(...registerables);
        Chart.register(LineElement, LineController, TimeScale, Title, Tooltip);
    }

    componentDidUpdate() {
        this.renderChart();
    }

    filterUsages() {
        const { usages, selectedType, selectedVersion, selectedDateRange } =
            this.props;
        let filteredUsages = usages;

        if (selectedType) {
            filteredUsages = filteredUsages.filter(
                (usage) => usage.type === selectedType
            );
        }

        if (selectedVersion) {
            filteredUsages = filteredUsages.filter(
                (usage) => usage.version === selectedVersion
            );
        }

        if (selectedDateRange) {
            const [startDate, endDate] = selectedDateRange.split(",");

            filteredUsages = filteredUsages.filter((usage) => {
                const usageDate = new Date(usage.dateTime);
                return (
                    usageDate >= new Date(startDate) &&
                    usageDate <= new Date(endDate)
                );
            });
        }

        return filteredUsages;
    }

    countServicesPerDay() {
        const filteredUsages = this.filterUsages();

        const serviceCounts = {};

        filteredUsages.forEach((usage) => {
            const date = new Date(usage.dateTime).toLocaleDateString();
            if (serviceCounts[date]) {
                serviceCounts[date]++;
            } else {
                serviceCounts[date] = 1;
            }
        });

        return serviceCounts;
    }

    generateDataPoints() {
        const serviceCounts = this.countServicesPerDay();

        const dataPoints = [];
        const currentDate = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - i);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            const localDate = date.toLocaleDateString();

            const count = serviceCounts[localDate] || 0;
            dataPoints.push({ x: date, y: count });
        }

        return dataPoints;
    }

    renderChart() {
        const dataPoints = this.generateDataPoints();

        const ctx = this.chartRef.current;

        new Chart(ctx, {
            type: "line",
            data: {
                datasets: [
                    {
                        data: dataPoints,
                        borderColor: "rgba(75, 192, 192, 1)",
                        fill: false,
                        label: "Test",
                    },
                ],
            },
            options: {
                scales: {
                    x: {
                        type: "time",
                        time: {
                            unit: "day",
                            displayFormats: {
                                day: "MMM dd",
                            },
                            display: false,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                console.log(context);
                                const d = new Date(context[0].parsed.x);

                                return d.toLocaleDateString([], {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                }); // Display only the date portion
                            },
                        },
                    },
                },
            },
        });
    }

    render() {
        return <canvas ref={this.chartRef} width="400" height="200"></canvas>;
    }
}

export default ChartComponent;
