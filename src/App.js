import React, { Component } from 'react';
import './styles/styles.css';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as d3 from 'd3';
import d3tooltip from 'd3-tooltip';
// import d3Tip from "d3-tip";
import AppServiceLogo from './images/app-service.svg';
import ServerGroupLogo from './images/server-group.svg';
import ServersLogo from './images/servers.svg';
import VirtualIpLogo from './images/virtual-ip.svg';
import VPortLogo from './images/v-port.svg';
import ApplicationsLogo from './images/aplications.svg';
import DatabaseLogo from './images/database.svg';

class App extends Component {
    componentDidMount() {
        this.drawForcedGraph();
    }

    drawForcedGraph = () => {
        var nodes_data = [
            {
                id: 0,
                name: 'AppService 6',
                img: AppServiceLogo,
                group: 'appservice',
                reflexive: false,
                threats: 10
            },
            {
                id: 1,
                name: 'VIP@10.23.12.106',
                img: VirtualIpLogo,
                group: 'vport',
                reflexive: false,
                threats: 2
            },
            {
                id: 2,
                name: 'ServiceGroup',
                img: VPortLogo,
                group: 'sg',
                reflexive: false,
                threats: 2
            },
            {
                id: 3,
                name: 'java',
                img: ServerGroupLogo,
                group: 'apps',
                reflexive: false,
                threats: 4
            },
            {
                id: 4,
                name: 'mongodb',
                group: 'db',
                img: DatabaseLogo,
                reflexive: false,
                threats: 10
            },
            {
                id: 5,
                name: 'mysql_d',
                img: DatabaseLogo,
                group: 'db',
                reflexive: false,
                threats: 12
            }
        ];

        //Sample links data
        //type: A for Ally, E for Enemy
        var links_data = [
            {
                source: nodes_data[0],
                target: nodes_data[1],
                left: false,
                right: true,
                traffic: Math.floor(Math.random() * 100 + 1)
            },
            {
                source: nodes_data[1],
                target: nodes_data[2],
                left: false,
                right: true,
                traffic: Math.floor(Math.random() * 100 + 1)
            },
            {
                source: nodes_data[2],
                target: nodes_data[3],
                left: false,
                right: true,
                traffic: Math.floor(Math.random() * 100 + 1)
            },
            {
                source: nodes_data[3],
                target: nodes_data[4],
                left: false,
                right: true,
                traffic: Math.floor(Math.random() * 100 + 1)
            },
            {
                source: nodes_data[3],
                target: nodes_data[5],
                left: false,
                right: true,
                traffic: Math.floor(Math.random() * 100 + 1)
            }
        ];
        var svg = d3.select('svg'),
            width = +svg.attr('width'),
            height = +svg.attr('height');
        var tooltip = d3tooltip(d3);
        var simulation = d3.forceSimulation().nodes(nodes_data);

        var link_force = d3.forceLink(links_data).id(function(d) {
            return d.name;
        });

        var charge_force = d3.forceManyBody().strength(-70);
        var center_force = d3.forceCenter(width / 2, height / 2);

        simulation
            .force('charge_force', charge_force)
            .force('center_force', center_force)
            // .force('xPosition', d3.forceX(function(d) {
            //     if(d.group == 'db') return 0;
            //     let forceX = 0;
            //         if (d.group == 'appservice') forceX = 80;
            //         return forceX;
            // }))
            .force(
                'yPosition',
                d3.forceY(function(d) {
                    let forceY = 450;
                    if (d.group == 'appservice') forceY = 10;
                    else if (d.group == 'vport') forceY = 100;
                    else if (d.group == 'sg') forceY = 190;
                    else if (d.group == 'apps') forceY = 300;
                    return forceY;
                })
            );
        //.force("collide", d3.forceCollide([5]).iterations([5]));

        simulation.on('tick', tickActions);
        var g = svg.append('g').attr('class', 'everything');
        var link = g
            .append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(links_data)
            .enter()
            .append('line')
            .attr('stroke-width', 2)
            .style('stroke', 'red');

        //draw circles for the nodes
        var singleG = g
            .append('g')
            .attr('class', 'node')
            .style('fill', '#fff')
            .selectAll('g')
            .data(nodes_data)
            .enter()
            .append('g');

        var node = singleG
            .append('svg:rect')
            .attr('class', function(d) {
                return d.group;
            })
            .on('mouseover', function(d) {
                tooltip.html(
                    `<p id="toolTip-nodes-threats">Threats: ${d.threats} </p>` +
                        `<p id="toolTip-nodes-info"><b>IP</b> : 172.18.0.27</p>` +
                        `<p id="toolTip-nodes-info"><b>Ports</b> : [27017, 27018, 27019]</p>` +
                        `<p id="toolTip-nodes-info"><b>Process ID</b> : 10712 </p>`
                );
                tooltip.show();
            })
            .on('mouseout', function() {
                tooltip.hide();
            });

        var textNode = singleG
            .append('svg:text')
            .attr('class', function(d) {
                return d.group;
            })
            .attr('dx', function(d) {
                var X = Number(getXFromCSS(d));
                    if(d.group == 'appservice')    
                        return X + 25;
                    return X + 50;
            })
            .attr('dy', function(d) {
                var Y = Number(getYFromCSS(d));
                    if (d.group === 'appservice') {
                        return Y + 75;
                    }
                    return Y + 15;
            })
            .text((d) => d.name)
            .attr('dominant-baseline', 'central');

        var imageNode = singleG
            .append('svg:image')
            // .attr("class", "image-class")
            .attr('class', function(d) {
                return 'image-' + d.group;
            })
            .attr('xlink:href', (d) => d.img)
            .attr('x', function(d) {
                var X = Number(getXFromCSS(d));
                if (d.group === 'appservice') {
                    return X + 15;
                }
                return X + 10;
            })
            .attr('y', function(d) {
                var Y = Number(getYFromCSS(d));
                if (d.group === 'appservice') {
                    return Y + 15;
                }
                return Y + 5;
            });

        var drag_handler = d3
            .drag()
            .on('start', drag_start)
            .on('drag', drag_drag)
            .on('end', drag_end);

        drag_handler(node);

        var zoom_handler = d3.zoom().on('zoom', zoom_actions);

        zoom_handler(svg);

        function getWidthFromCSS(d) {
            const sourceClass = document.querySelector('.' + d.group);
            const sourceStyle = getComputedStyle(sourceClass);
            const width = sourceStyle.width.replace('px', '');
            return width;
        }
        function getHeightFromCSS(d) {
            const sourceClass = document.querySelector('.' + d.group);
            const sourceStyle = getComputedStyle(sourceClass);
            const height = sourceStyle.height.replace('px', '');
            return height;
        }

        function getXFromCSS(d) {
            const sourceClass = document.querySelector('.' + d.group);
            const sourceStyle = getComputedStyle(sourceClass);
            const X = sourceStyle.x.replace('px', '');
            return X;
        }
        function getYFromCSS(d) {
            const sourceClass = document.querySelector('.' + d.group);
            const sourceStyle = getComputedStyle(sourceClass);
            const Y = sourceStyle.y.replace('px', '');
            return Y;
        }

        function drag_start(d) {
            if (!d3.event.active) simulation.alphaTarget(0.9).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        //make sure you can't drag the circle outside the box
        function drag_drag(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function drag_end(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        function zoom_actions() {
            g.attr('transform', d3.event.transform);
        }

        function tickActions() {
            imageNode
                .attr('x', function(d) {
                    var X = Number(getXFromCSS(d));
                    if (d.group === 'appservice') {
                        return X + 15;
                    }
                    return X + 10;
                })
                .attr('y', function(d) {
                    var Y = Number(getYFromCSS(d));
                    if (d.group === 'appservice') {
                        return Y + 15;
                    }
                    return Y + 5;
                });
            textNode
                .attr('dx', function(d) {
                    var X = Number(getXFromCSS(d));
                    if(d.group == 'appservice')    
                        return X + 25;
                    return X + 50;
                })
                .attr('dy', function(d) {
                    var Y = Number(getYFromCSS(d));
                    if (d.group === 'appservice') {
                        return Y + 75;
                    }
                    return Y + 15;
                });

            //update circle positions each tick of the simulation
            node.attr('x', function(d) {
                return d.x;
            }).attr('y', function(d) {
                return d.y;
            });

            //update link positions
            link.attr('x1', function(d) {
                const sourceClass = document.querySelector('.' + d.source.group);
                const targetClass = document.querySelector('.' + d.target.group);
                var sourceStyle = getComputedStyle(sourceClass);
                var targetStyle = getComputedStyle(targetClass);

                var sourceWidth = sourceStyle.width.replace('px', '');
                var sourceHeight = sourceStyle.height.replace('px', '');

                var targetWidth = targetStyle.width.replace('px', '');
                var targetHeight = targetStyle.height.replace('px', '');

                // extra calculations
                const deltaX = d.target.x - d.source.x;
                const deltaY = d.target.y - d.source.y;
                const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const normX = deltaX / dist;
                const normY = deltaY / dist;
                const sourcePadding = d.left ? 2 : 3;
                const targetPadding = d.right ? 2 : 3;
                let sourceX = d.source.x + sourceWidth / 2 + sourcePadding * normX;
                return sourceX;
            })
                .attr('y1', function(d) {
                    return d.source.y;
                })
                .attr('x2', function(d) {
                    const sourceClass = document.querySelector('.' + d.source.group);
                    const targetClass = document.querySelector('.' + d.target.group);
                    var sourceStyle = getComputedStyle(sourceClass);
                    var targetStyle = getComputedStyle(targetClass);

                    var sourceWidth = sourceStyle.width.replace('px', '');
                    var sourceHeight = sourceStyle.height.replace('px', '');

                    var targetWidth = targetStyle.width.replace('px', '');
                    var targetHeight = targetStyle.height.replace('px', '');

                    // extra calculations
                    const deltaX = d.target.x - d.source.x;
                    const deltaY = d.target.y - d.source.y;
                    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    const normX = deltaX / dist;
                    const normY = deltaY / dist;
                    const sourcePadding = d.left ? 2 : 3;
                    const targetPadding = d.right ? 2 : 3;
                    const targetX = d.target.x + targetWidth / 2 - targetPadding * normX;
                    let sourceX = d.source.x + sourceWidth / 2 + sourcePadding * normX;
                    return targetX;
                })
                .attr('y2', function(d) {
                    const sourceClass = document.querySelector('.' + d.source.group);
                    const targetClass = document.querySelector('.' + d.target.group);
                    var sourceStyle = getComputedStyle(sourceClass);
                    var targetStyle = getComputedStyle(targetClass);

                    var sourceWidth = sourceStyle.width.replace('px', '');
                    var sourceHeight = sourceStyle.height.replace('px', '');

                    var targetWidth = targetStyle.width.replace('px', '');
                    var targetHeight = targetStyle.height.replace('px', '');

                    // extra calculations
                    const deltaX = d.target.x - d.source.x;
                    const deltaY = d.target.y - d.source.y;
                    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    const normX = deltaX / dist;
                    const normY = deltaY / dist;
                    const sourcePadding = d.left ? 2 : 3;
                    const targetPadding = d.right ? 2 : 3;
                    let sourceX = d.source.x + sourceWidth / 2 + sourcePadding * normX;
                    const targetY = d.target.y + Number(targetHeight);
                    return targetY;
                });
        }
    };

    render() {
        return (
            <div id="body">
                <svg width="1000" height="500" />
            </div>
        );
    }
}

export default App;
