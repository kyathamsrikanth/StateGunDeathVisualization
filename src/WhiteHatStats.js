import React, { useEffect, useRef } from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

export default function WhiteHatStats(props) {
    const chartContainer = useRef(null);
    const [svg, height, width, tooltip] = useSVGCanvas(chartContainer);

    const margins = 50;

    useEffect(() => {
        if (svg === undefined || props.data === undefined) {
            return;
        }

        const genderData = [];
        
        for (let i = 0; i < props.data.states.length; i++) {
            const stateData = props.data.states[i];
            const totalDeaths = stateData.count;
            const maleDeaths = stateData.male_count;
            const femaleDeaths = totalDeaths - stateData.male_count;
            
            genderData.push({
                stateAbbr: stateData.abreviation,
                stateName: stateData.state,
                totalDeaths,
                maleDeaths,
                femaleDeaths
            });
        }

        const xScale = d3
            .scaleBand()
            .domain(genderData.map((d) => d.stateAbbr))
            .range([50, width - 1])
            .padding(0.2);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(genderData, (d) => Math.max(d.maleDeaths, d.femaleDeaths))])
            .nice()
            .range([height - margins, margins]);

        svg.selectAll('.bar-male').remove();
        svg.selectAll('.bar-female').remove();

        svg.selectAll('.bar-male')
            .data(genderData)
            .enter()
            .append('rect')
            .attr('class', 'bar-male')
            .attr('x', (d) => xScale(d.stateAbbr))
            .attr('y', (d) => yScale(d.maleDeaths))
            .attr('width', xScale.bandwidth() / 2)
            .attr('height', (d) => height - margins - yScale(d.maleDeaths))
            .attr('fill', 'steelblue')
            .on('mouseover', (e, d) => {
                const tooltipText = `${d.stateName}</br>Gun Deaths: ${d.totalDeaths}</br>Male Deaths: ${d.maleDeaths}`;
                props.ToolTip.moveTTipEvent(tooltip, e);
                tooltip.html(tooltipText);
            })
            .on('mousemove', (e) => {
                props.ToolTip.moveTTipEvent(tooltip, e);
            })
            .on('mouseout', () => {
                props.ToolTip.hideTTip(tooltip);
            });

        svg.selectAll('.bar-female')
            .data(genderData)
            .enter()
            .append('rect')
            .attr('class', 'bar-female')
            .attr('x', (d) => xScale(d.stateAbbr) + xScale.bandwidth() / 2)
            .attr('y', (d) => yScale(d.femaleDeaths))
            .attr('width', xScale.bandwidth() / 2)
            .attr('height', (d) => height - margins - yScale(d.femaleDeaths))
            .attr('fill', 'red')
            .on('mouseover', (e, d) => {
                const tooltipText = `${d.stateName}</br>Gun Deaths: ${d.totalDeaths}</br>Female Deaths: ${d.femaleDeaths}`;
                props.ToolTip.moveTTipEvent(tooltip, e);
                tooltip.html(tooltipText);
            })
            .on('mousemove', (e) => {
                props.ToolTip.moveTTipEvent(tooltip, e);
            })
            .on('mouseout', () => {
                props.ToolTip.hideTTip(tooltip);
            });

        svg.selectAll('.x-axis').remove();
        svg.selectAll('.y-axis').remove();

        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height - margins})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .style('text-anchor', 'middle');

        svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${margins},0)`)
            .call(d3.axisLeft(yScale));

        svg.selectAll('.chart-title').remove();
        svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', width / 2)
            .attr('y', margins / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', 20)
            .attr('font-weight', 'bold')
            .text('Gun Deaths by State (Male and Female)');

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .text('State');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', margins / 2 - 10)
            .attr('text-anchor', 'middle')
            .text('Deaths');
    }, [props.data, svg]);

    return (
        <div className={"d3-component"} style={{ 'height': '100%', 'width': '100%' }} ref={chartContainer}></div>
    );
}
