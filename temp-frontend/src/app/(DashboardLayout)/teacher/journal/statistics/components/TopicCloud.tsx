'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

interface TopicData {
    topic: string;
    weight: number;
}

interface TopicCloudProps {
    data: TopicData[];
}

export default function TopicCloud({ data }: TopicCloudProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        // Clear previous content
        d3.select(svgRef.current).selectAll("*").remove();

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        // Calculate font sizes
        const minWeight = Math.min(...data.map(d => d.weight));
        const maxWeight = Math.max(...data.map(d => d.weight));
        const fontSize = d3.scaleLinear()
            .domain([minWeight, maxWeight])
            .range([14, 60]);

        // Color scale
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Create word cloud layout
        const layout = cloud()
            .size([width, height])
            .words(data.map(d => ({
                text: d.topic,
                size: fontSize(d.weight),
                value: d.weight,
            })))
            .padding(5)
            .rotate(() => 0)
            .fontSize(d => d.size)
            .on("end", draw);

        // Start layout calculation
        layout.start();

        // Draw function
        function draw(words: any[]) {
            const svg = d3.select(svgRef.current)
                .attr("width", width)
                .attr("height", height);

            const g = svg.append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`);

            g.selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", d => `${d.size}px`)
                .style("font-family", "Impact")
                .style("fill", (_, i) => color(i.toString()))
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
                .text(d => d.text)
                .style("cursor", "pointer")
                .on("mouseover", function() {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("font-size", d => `${(d as any).size * 1.2}px`);
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("font-size", d => `${(d as any).size}px`);
                })
                .append("title")
                .text(d => `${d.text}: ${(d as any).value} occurrences`);
        }
    }, [data]);

    return (
        <svg
            ref={svgRef}
            style={{
                width: '100%',
                height: '100%',
                overflow: 'visible',
            }}
        />
    );
}
