var socket = io.connect(location.protocol + '//' + location.host);

var chartList = {};

socket.on('shepInd', function (ind) {
    var data = ind.data,
        chart,
        time;

    switch (ind.type) {
        case 'registered':
            devList[data.clientName] = data;
            break;
        case 'update':

            break;
        case 'deregistered':
            delete devList[data];
            break;
        case 'online':
            devList[data].status = 'online';

            $.notify({
                icon: 'fa fa-arrow-circle-o-up',
                message: ' Device ' + data + ' online.'
            }, {
                type: 'success'
            });
            break;   
        case 'offline':
            devList[data].status = 'offline';

            $.notify({
                icon: 'fa fa-arrow-circle-o-down',
                message: ' Device ' + data + ' offline.'
            }, {
                type: 'warning'
            });
            break;
        case 'notify':
            if (devList[data.device].status === 'online') {
                devList[data.device].so[data.oid][data.iid][data.rid] = data.data;
                renderoObserveList();

                chart = chartList['chartdiv' + data.oid + '_' + data.iid + '_' + data.rid];
            
                if (chart) {
                    time = getTime();
                    chart.dataSets[0].dataProvider.push({ date: time, value: data.data});
                    chart.validateData();
                }
            }
            break;
    }
});

var ObsBox = React.createClass({
    render: function () {
        var clientName = this.props.clientName,
            pathArray = pathSlashParser(this.props.path),
            value = devList[clientName].so[pathArray[0]][pathArray[1]][pathArray[2]],
            time = getTime(),
            collapseId = pathArray[0] + '_' + pathArray[1] + '_' + pathArray[2],
            collapseHref = '#' + collapseId,
            chartdivId = 'chartdiv' + collapseId;

        if (!chartList[chartdivId]) {
            chartList[chartdivId] = {

            type: "stock",
            "theme": "none",
            pathToImages: "http://www.amcharts.com/lib/3/images/",
            glueToTheEnd: true,

            categoryAxesSettings: {
                minPeriod: "1500fff"
            },

            dataSets: [{
                color: "#b0de09",
                fieldMappings: [{
                    fromField: "value",
                    toField: "value"
                }, {
                    fromField: "volume",
                    toField: "volume"
                }],

                dataProvider: [{ date: time, value: value }],
                categoryField: "date"
            }],

            panels: [{
                    showCategoryAxis: true,
                    title: "Sensor Data",
                    percentHeight: 70,

                    stockGraphs: [{
                        id: "g1",
                        valueField: "value",
                        lineThickness: 2,
                        bullet: "round",
                    }],


                    stockLegend: {
                        valueTextRegular: " ",
                        markerType: "none"
                    }
                }
            ],

            chartScrollbarSettings: {
                graph: "g1",
                usePeriod: "ss",
                position: "bottom",
                autoGridCount: false
            },

            chartCursorSettings: {
                valueBalloonsEnabled: true
            },

            panelsSettings: {
                usePrefixes: true
            }
        };
        }

        return (
            <div>
                <div className='col-sm-6 col-md-6'>
                    <div className='panel panel-primary'>
                        <a data-toggle="collapse" href={collapseHref}>
                            <div className='panel-heading bg-primary'>
                                <div className='row'>
                                    <div className='col-sm-4 col-md-4'>
                                        <h4>Instance: {pathArray[1]}</h4>
                                    </div>

                                    <div className='col-sm-4 col-md-4'>
                                        <h4>{pathArray[2]}</h4>
                                    </div>

                                    <div className='col-sm-4 col-md-4'>
                                        <h4 className="text-right">{value}</h4>
                                    </div>
                                </div>
                            </div>
                        </a>

                        <div id={collapseId} className="panel-collapse collapse">
                            <div className="panel-body">
                                <div className='chartdiv' id={chartdivId}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var ObsTable = React.createClass({
    render: function () {
        var clientName = this.props.clientName,
            obsRender = [];

        _.forEach(this.props.pathList, function (path) {
            obsRender.push(
                <ObsBox clientName={clientName} path={path} />
            );
        });

        return (
            <div>
                <div className="panel panel-orange">
                    <div className="panel-heading bg-orange">
                        <h4>{this.props.oid}</h4>
                    </div>

                    <div className="panel-body">
                        {obsRender}
                    </div>
                </div>
            </div>
        );
    }
});

var DevBox = React.createClass({
    render: function () {
        var clientName = this.props.dev.clientName,
            obsTableRender = [],
            obsTable = {},
            pathArray;

        _.forEach(this.props.dev.observeList, function (path) {
            pathArray = pathSlashParser(path);

            if (pathArray[0] && !_.has(obsTable, pathArray[0]))
                obsTable[pathArray[0]] = [];

            obsTable[pathArray[0]].push(path);
        });

        _.forEach(obsTable, function (pathList, oid) {
            obsTableRender.push(
                <div>
                    <ObsTable clientName={clientName} oid={oid} pathList={pathList} />
                </div>
            );
        });

        return (
            <div>
                <h2 className='page-header'>Device: {clientName}</h2>
                <div>{obsTableRender}</div>
            </div>
        );
    }
});

var DevTable = React.createClass({
    render: function () {
        var devRender = [];

        _.forEach(this.props.devList, function (dev, clientName) {
            if (dev.status === 'online') {
                devRender.push(
                    <div className='col-sm-12 col-md-12'>
                        <DevBox key='{clientName}' dev={dev} />
                    </div>
                );
            }
        });

        return (
            <div>
                {devRender}
            </div>
        );
    }
});

function pathSlashParser (path) {          // '/x/y/z'
    var pathArray = path.split('/');

    if (pathArray[0] === '') 
        pathArray = pathArray.slice(1);

    if (pathArray[pathArray.length-1] === '')           
        pathArray = pathArray.slice(0, pathArray.length-1);

    return pathArray;       // ['x', 'y', 'z']
}

function getTime() {
    var date = new Date(),
        month = (date.getMonth() + 1),
        day = date.getDate(),
        hours = date.getHours(),
        mins = date.getMinutes(),
        secs = date.getSeconds(),
        time;

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;
        if (hours < 10) hours = '0' + hours;    
        if (mins < 10) mins = '0' + mins;
        if (secs < 10) secs = '0' + secs;

        time = date.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + mins + ':' + secs;

        return time;
}

function renderoObserveList() {
    if (!_.isEmpty(devList)) {
        ReactDOM.render(
            <DevTable devList={devList} />,
            document.getElementById('observeList')
        );
    }
}

renderoObserveList();

_.forEach(chartList, function (chart, chartdivId) {
    chartList[chartdivId] = AmCharts.makeChart(chartdivId, chart);
});
