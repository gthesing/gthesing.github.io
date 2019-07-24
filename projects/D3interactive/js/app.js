
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = 'poverty';
var chosenYAxis = 'obesity';

// Functions to update chart scales based on inputs
function xScale(healthData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) *0.9, 
            d3.max(healthData, d => d[chosenXAxis]) * 1.05])
        .range([0, width]);
    return xLinearScale;
};

function yScale(healthData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8, 
            d3.max(healthData, d => d[chosenYAxis])])
        .range([height, 0]);
    return yLinearScale;
};

// Functions to update chosen axes
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition().duration(1000).call(bottomAxis);
    return xAxis;
};

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition().duration(1000).call(leftAxis);
    return yAxis;
};

// Function to update circles
function updateCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr('cx', d => newXScale(d[chosenXAxis]))
        .attr('cy', d => newYScale(d[chosenYAxis]));
    return circlesGroup;
};

// Need an update circle labels funtion
function updateCircleLabels(circleLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circleLabels.transition()
        .duration(1000)
        .attr('x', d => newXScale(d[chosenXAxis]))
        .attr('y', d => newYScale(d[chosenYAxis]) + 5)
    return circleLabels;
};

// Function to update tooltip
function updateToolTip(newXAxis, newYAxis, circlesGroup) {
    if (newXAxis === 'poverty') {
        var xlabel = 'Poverty Rate (%)';
    } else if (newXAxis === 'age') {
        var xlabel = 'Median Age (years)';
    } else {
        var xlabel = 'Median Income ($)';
    };
    
    if (newYAxis === 'obesity') {
        var ylabel = 'Obesity Rate (%)';
    } else if (newYAxis === 'smokes') {
        var ylabel = 'Smoking Rate (%)';
    } else {
        var ylabel = 'Uninsured (%)';
    };

    var toolTip = d3.tip()
        .attr('class', 'tooltip')
        .offset([100, -85])
        .html(d => {
            return (`${d.state}<br>${xlabel}: ${d[newXAxis]}<br>${ylabel}: ${d[newYAxis]}`)
        });
    
    circlesGroup.call(toolTip);
    
    circlesGroup.on('mouseenter', d => {
        toolTip.show(d);
    });

    circlesGroup.on('mouseleave', d => {
        toolTip.hide(d);
    });

    return circlesGroup;
};

// Get csv data 
d3.csv('https://raw.githubusercontent.com/gthesing/gthesing.github.io/master/projects/D3interactive/data.csv', function(healthData){

    // Data parsing
    healthData.forEach(function(d) {
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
        d.healthcare = +d.healthcare
    });

    // Create scales dependent on chosen axis
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes
    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append('g')
        .call(leftAxis);

    var circleLabels = chartGroup.selectAll('.state-abbr')
        .data(healthData)
        .enter()
        .append('text')
        .text(d => d.abbr)
        .attr('font-size', 15)
        .attr('font-color', 'white')
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis]) + 5)
        .classed('state-abbr', true);

    // Create/append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(healthData)
        .enter()
        .append('circle')
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', 18)
        .classed('stateCircle', true)
        .attr('id', d => d.abbr);
    
    // Create groups for axis labels
    var xLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 20})`);
    var yLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(-65, ${height / 2}) rotate(-90)`);

    // Append xLabelsGroup for the three x labels
    var povertyLabel = xLabelsGroup.append('text')
        .attr('x', 0).attr('y', 20)
        .attr('value', 'poverty')
        .attr('id', 'poverty')
        .classed('inactive', false)
        .classed('active', true)
        .text('Poverty Rate (%)');

    var ageLabel = xLabelsGroup.append('text')
        .attr('x', 0).attr('y', 40)
        .attr('value', 'age')
        .attr('id', 'age')
        .classed('active', false).classed('inactive', true)
        .text('Median Age (years)');

    var incomeLabel = xLabelsGroup.append('text')
        .attr('x', 0).attr('y', 60)
        .attr('value', 'income')
        .attr('id', 'income')
        .classed('active', false).classed('inactive', true)
        .text('Median Income ($)')

    // Append yLabelsGroup for the three y labels
    var obesityLabel = yLabelsGroup.append('text')
        .attr('x', 0).attr('y', 0)
        .attr('value', 'obesity')
        .attr('id', 'obesity')
        .classed('active', true).classed('inactive', false)
        .text('Obesity Rate (%)');

    var smokesLabel = yLabelsGroup.append('text')
        .attr('x', 0).attr('y', 20)
        .attr('value', 'smokes')
        .attr('id', 'smokes')
        .classed('active', false).classed('inactive', true)
        .text('Smoking Rate (%)')
    
    var healthcareLabel = yLabelsGroup.append('text')
        .attr('x', 0).attr('y', 40)
        .attr('value', 'healthcare')
        .attr('id', 'healthcare')
        .classed('active', false).classed('inactive', true)
        .text('Uninsured (%)')

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X axis event listener
    xLabelsGroup.selectAll('text').on('click', function() {

        var value = d3.select(this).attr('value');

        if (value !== chosenXAxis) {

            chosenXAxis = value;

            // update scale, axis, circles, circle labels, tooltip
            xLinearScale = xScale(healthData, chosenXAxis);

            xAxis = renderXAxis(xLinearScale, xAxis);

            circlesGroup = updateCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circleLabels = updateCircleLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Make selected x axis label bold
            if (chosenXAxis === 'poverty') {
                d3.select('#poverty').classed('active', true).classed('inactive', false);
                d3.select('#age').classed('active', false).classed('inactive', true);
                d3.select('#income').classed('active', false).classed('inactive', true);
            } else if (chosenXAxis === 'age') {
                d3.select('#poverty').classed('active', false).classed('inactive', true);
                d3.select('#age').classed('active', true).classed('inactive', false);
                d3.select('#income').classed('active', false).classed('inactive', true);
            } else {
                d3.select('#poverty').classed('active', false).classed('inactive', true);
                d3.select('#age').classed('active', false).classed('inactive', true);
                d3.select('#income').classed('active', true).classed('inactive', false);
            };
        }
    });

    // Y axis event listener
    yLabelsGroup.selectAll('text').on('click', function() {

        var value = d3.select(this).attr('value');
        if (value !== chosenYAxis) {

            chosenYAxis = value;

            // update scale, axis, circles, circle labels, tooltip
            yLinearScale = yScale(healthData, chosenYAxis);

            yAxis = renderYAxis(yLinearScale, yAxis);

            circlesGroup = updateCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circleLabels = updateCircleLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Make selected y axis label bold
            if (chosenYAxis === 'obesity') {
                d3.select('#obesity').classed('active', true).classed('inactive', false);
                d3.select('#smokes').classed('active', false).classed('inactive', true);
                d3.select('#healthcare').classed('active', false).classed('inactive', true);
            } else if (chosenYAxis === 'smokes') {
                d3.select('#obesity').classed('active', false).classed('inactive', true);
                d3.select('#smokes').classed('active', true).classed('inactive', false);
                d3.select('#healthcare').classed('active', false).classed('inactive', true);
            } else {
                d3.select('#obesity').classed('active', false).classed('inactive', true);
                d3.select('#smokes').classed('active', false).classed('inactive', true);
                d3.select('#healthcare').classed('active', true).classed('inactive', false);
            };
        }
    });
});
