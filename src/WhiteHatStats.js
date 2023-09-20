import React, { useEffect, useRef } from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

export default function WhiteHatStats(props) {
  const d3Container = useRef(null);
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const margin = 40;

  useEffect(() => {
    if (svg === undefined || props.data === undefined) {
      return;
    }

    // Extract gun death data for each state
    const data = props.data.states;

    // Sort the data by gun death count in descending order
    data.sort((a, b) => b.count - a.count);

    // Create scales for the x and y axes
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.state))
      .range([margin, width - margin])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([height - margin, margin]);

    svg.selectAll('.bar').remove();
    svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.state))
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin - yScale(d.count))
      .attr('fill', 'steelblue')
      .on('mouseover', (e, d) => {
        const string = `${d.state}</br>Gun Deaths: ${d.count}`;
        props.ToolTip.moveTTipEvent(tTip, e);
        tTip.html(string);
      })
      .on('mousemove', e => {
        props.ToolTip.moveTTipEvent(tTip, e);
      })
      .on('mouseout', () => {
        props.ToolTip.hideTTip(tTip);
      });


    svg.selectAll('.x-axis').remove();
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - margin})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-45)');

    svg.selectAll('.y-axis').remove();
    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin}, 0)`)
      .call(d3.axisLeft(yScale));

    const labelSize = margin / 2;
    svg.selectAll('.chart-title').remove();
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', labelSize)
      .attr('text-anchor', 'middle')
      .attr('font-size', labelSize)
      .attr('font-weight', 'bold')
      .text('Gun Deaths by State');

  }, [props.data, svg]);

  return (
    <div
      className={"d3-component"}
      style={{ 'height': '99%', 'width': '99%' }}
      ref={d3Container}
    ></div>
  );
}
