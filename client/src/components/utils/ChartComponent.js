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
import "../../styles/components/utils/ChartComponent.css";

export default class ChartComponent extends Component {
    chartRef = createRef();
    aspectRatio = window.innerWidth < 1020 ? 0.8 : 9 / 16;

    constructor() {
        super();
        Chart.register(...registerables);
        Chart.register(LineElement, LineController, TimeScale, Title, Tooltip);
    }

    componentDidMount() {
        const handleResize = () => {
            if (window.innerWidth < 1020) {
                this.aspectRatio = 0.8;
            } else {
                this.aspectRatio = 9 / 16;
            }
            if (this.chartInstance) {
                this.renderChart();
            }
        };

        window.addEventListener("resize", handleResize);
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.usages !== this.props.usages ||
            prevProps.selectedType !== this.props.selectedType ||
            prevProps.selectedVersion !== this.props.selectedVersion ||
            prevProps.selectedDateRange !== this.props.selectedDateRange
        ) {
            this.renderChart();
        }
    }

    filterUsages() {
        let filteredUsages = this.props.usages;

        if (
            this.props.selectedType &&
            this.props.selectedType !== "All Types"
        ) {
            filteredUsages = filteredUsages.filter(
                (usage) => usage.type === this.props.selectedType
            );
        }

        if (
            this.props.selectedVersion &&
            this.props.selectedVersion !== "All Versions"
        ) {
            filteredUsages = filteredUsages.filter(
                (usage) => usage.version === this.props.selectedVersion
            );
        }

        if (
            this.props.selectedDateRange &&
            this.props.selectedDateRange !== "All Dates"
        ) {
            let startDate, endDate;

            switch (this.props.selectedDateRange) {
                case "Past 1 Week":
                    endDate = new Date();
                    startDate = new Date();
                    startDate.setDate(endDate.getDate() - 7);
                    break;

                case "Past 1 Month":
                    endDate = new Date();
                    startDate = new Date();
                    startDate.setMonth(endDate.getMonth() - 1);
                    break;

                case "Past 3 Months":
                    endDate = new Date();
                    startDate = new Date();
                    startDate.setMonth(endDate.getMonth() - 3);
                    break;
            }

            filteredUsages = filteredUsages.filter((usage) => {
                const usageDate = new Date(usage.dateTime);
                return (
                    usageDate >= new Date(startDate) &&
                    usageDate <= new Date(endDate)
                );
            });
        }

        this.props.onFilter(filteredUsages);
        return filteredUsages;
    }

    getDataPoints() {
        const filteredUsages = this.filterUsages();
        let dataPoints = [];
        let unit = "day";

        if (filteredUsages.length > 0) {
            if (this.props.selectedDateRange === "Past 1 Month") {
                unit = "week";
                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);

                while (startDate <= new Date()) {
                    const count = filteredUsages.filter((usage) => {
                        const usageDate = new Date(usage.dateTime);
                        return (
                            usageDate >= startDate &&
                            usageDate <
                                new Date(
                                    startDate.getTime() + 24 * 60 * 60 * 1000
                                ) // Add 24 hours to include the entire day
                        );
                    }).length;

                    dataPoints.push({ x: new Date(startDate), y: count });
                    startDate.setDate(startDate.getDate() + 1);
                }
            } else if (this.props.selectedDateRange === "Past 1 Week") {
                unit = "day";
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);

                while (startDate <= new Date()) {
                    const count = filteredUsages.filter((usage) => {
                        const usageDate = new Date(usage.dateTime);
                        return (
                            usageDate >= startDate &&
                            usageDate <
                                new Date(
                                    startDate.getTime() + 24 * 60 * 60 * 1000
                                ) // Add 24 hours to include the entire day
                        );
                    }).length;

                    dataPoints.push({ x: new Date(startDate), y: count });
                    startDate.setDate(startDate.getDate() + 1);
                }
            } else if (this.props.selectedDateRange === "Past 3 Months") {
                unit = "month";
                const endDate = new Date();
                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 3);
                startDate.setDate(1); // Start from the beginning of the month

                while (startDate <= endDate) {
                    const count = filteredUsages.filter((usage) => {
                        const usageDate = new Date(usage.dateTime);
                        return (
                            usageDate >= startDate &&
                            usageDate <
                                new Date(
                                    startDate.getFullYear(),
                                    startDate.getMonth() + 1,
                                    0
                                ) // Calculate the last day of the current month
                        );
                    }).length;

                    dataPoints.push({ x: new Date(startDate), y: count });
                    startDate.setMonth(startDate.getMonth() + 1);
                }
            } else if (this.props.selectedDateRange === "All Dates") {
                // Handle "All Dates" date range
                if (filteredUsages.length > 0) {
                    const earliestUsage = filteredUsages.reduce((min, usage) =>
                        usage.dateTime < min.dateTime ? usage : min
                    );
                    const latestUsage = filteredUsages.reduce((max, usage) =>
                        usage.dateTime > max.dateTime ? usage : max
                    );

                    const timeDiff =
                        new Date(latestUsage.dateTime) -
                        new Date(earliestUsage.dateTime);
                    const gapInDays = Math.ceil(
                        timeDiff / (1000 * 60 * 60 * 24)
                    );
                    if (gapInDays > 30) {
                        unit = "month";
                        const endDate = new Date();
                        const startDate = new Date(earliestUsage.dateTime);
                        startDate.setDate(1);

                        while (startDate <= endDate) {
                            const count = filteredUsages.filter((usage) => {
                                const usageDate = new Date(usage.dateTime);
                                return (
                                    usageDate >= startDate &&
                                    usageDate <
                                        new Date(
                                            startDate.getFullYear(),
                                            startDate.getMonth() + 1,
                                            0
                                        ) // Calculate the last day of the current month
                                );
                            }).length;

                            dataPoints.push({
                                x: new Date(startDate),
                                y: count,
                            });
                            startDate.setMonth(startDate.getMonth() + 1);
                        }
                    } else {
                        unit = "day";
                        for (let i = 0; i < gapInDays; i++) {
                            const currentDate = new Date(
                                earliestUsage.dateTime
                            );
                            currentDate.setDate(currentDate.getDate() + i);
                            const count = filteredUsages.filter((usage) => {
                                const usageDate = new Date(usage.dateTime);
                                console.log(usageDate, currentDate);
                                return (
                                    usageDate >= currentDate &&
                                    usageDate <
                                        new Date(
                                            currentDate.getTime() +
                                                24 * 60 * 60 * 1000
                                        ) // Add 24 hours to include the entire day
                                );
                            }).length;
                            dataPoints.push({ x: currentDate, y: count });
                        }
                    }
                }
            }
        } else {
            unit = "week";
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);

            while (startDate < new Date()) {
                dataPoints.push({ x: new Date(startDate), y: 0 });
                startDate.setDate(startDate.getDate() + 1);
            }
        }

        for (const dataPoint of dataPoints) {
            dataPoint.x = new Date(dataPoint.x).setHours(0);
        }

        return [dataPoints, unit];
    }

    renderChart() {
        const [dataPoints, unit] = this.getDataPoints();

        const ctx = this.chartRef.current;

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const chartOptions = {
            type: "line",
            data: {
                datasets: [
                    {
                        data: dataPoints,
                        borderColor: "rgb(163, 56, 115)",
                        backgroundColor: "transparent",
                        fill: false,
                        label: "Usages for " + this.props.selectedType,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: this.aspectRatio,
                scales: {
                    x: {
                        type: "time",
                        time: {
                            unit: unit,
                            displayFormats: {
                                day: "MMM dd", // Display day interval as "MMM dd"
                                month: "MMM yyyy", // Display month interval as "MMM yyyy"
                                year: "YYYY", // Display year interval as "YYYY"
                                hour: "MMM dd, hA", // Display hour interval as "MMM dd, hA"
                            },
                        },
                        offset: true,
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 10,
                            stepSize: 1,
                        },
                        grid: {
                            lineWidth: 0,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                        },
                        suggestedMax:
                            Math.max(
                                ...dataPoints.map((dataPoint) => dataPoint.y)
                            ) + 1,
                        grid: {
                            lineWidth: 0,
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const d = new Date(context[0].parsed.x);

                                const options = {
                                    month: "short",
                                    year: "numeric",
                                };

                                if (unit === "day") {
                                    options.day = "2-digit";
                                }

                                return d.toLocaleDateString([], options);
                            },
                        },
                    },
                },
            },
        };

        this.chartInstance = new Chart(ctx, chartOptions);
    }

    render() {
        return <canvas className="usage-chart" ref={this.chartRef}></canvas>;
    }
}
