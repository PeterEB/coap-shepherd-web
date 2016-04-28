var socket = io.connect(location.protocol + '//' + location.host);

socket.on('shepInd', function (ind) {
    var data = ind.data;

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
            break;   
        case 'offline':
            devList[data].status = 'offline';
            break;
        case 'notify':
            if (devList[data.device].status === 'online') {
                devList[data.device].so[data.oid][data.iid][data.rid] = data.data;
                renderoObserveList();
            }
            break;
    }
});

var ObsBox = React.createClass({
    render: function () {
        var clientName = this.props.clientName,
            pathArray = pathSlashParser(this.props.path),
            value = devList[clientName].so[pathArray[0]][pathArray[1]][pathArray[2]];

        return (
            <div>
                <div className='col-sm-4 col-md-4'>
                    <div className='panel panel-primary'>
                        <div className='panel-heading'>
                            <div className='row'>
                                <div className='col-sm-8 col-md-8'>
                                    <h4>
                                        /{pathArray[1]}/{pathArray[2]}
                                    </h4>
                                </div>

                                <div className='col-sm-4 col-md-4'>
                                    <h4>
                                        {value}
                                    </h4>
                                </div>
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
                <div className="panel panel-info">
                    <div className="panel-heading">
                        <h4 className="panel-title">
                            {this.props.oid}
                        </h4>
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
                <h2 className='page-header'>{clientName}</h2>
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

function renderoObserveList() {
    if (!_.isEmpty(devList)) {
        ReactDOM.render(
            <DevTable devList={devList} />,
            document.getElementById('observeList')
        );
    }
}

renderoObserveList();