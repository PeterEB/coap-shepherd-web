var socket = io.connect(location.protocol + '//' + location.host);

socket.on('shepInd', function (ind) {
    var data = ind.data;

    switch (ind.type) {
        case 'registered':
            devList[data.clientName] = data;
            renderDevList();
            break;
        case 'update':

            break;
        case 'deregistered':
            delete devList[data];
            renderDevList();
            break;
        case 'online':
            devList[data].status = 'online';
            renderDevList();
            break;   
        case 'offline':
            devList[data].status = 'offline';
            renderDevList();
            break;
    }


});

var DevBox = React.createClass({
    getInitialState: function () {
        var boxClassName;

        if(this.props.dev.status === 'online')
            boxClassName = 'panel panel-yellow';
        else
            boxClassName = 'panel panel-green';

        return {
            boxClassName: boxClassName
        };
    },
    render: function () {
        var joinTime = new Date(this.props.dev.joinTime),
            month = joinTime.getUTCMonth(),
            day = joinTime.getUTCDate(),
            hour = joinTime.getUTCHours(),
            minute = joinTime.getUTCMinutes(),
            devHref = '/dev/' + this.props.dev.clientName;

        if (month < 10)
            month = '0' + month;

        if (day < 10)
            day = '0' + day;

        if (hour < 10)
            hour = '0' + hour;    

        if (minute < 10)
            minute = '0' + minute;

        return (
            <div className={this.state.boxClassName}>
                <a href={devHref}>
                    <div className='panel-heading'>
                        <div className='row'>
                            <div className='col-sm-4 col-md-4'>
                                <div className='huge'>{this.props.dev.clientName}</div>
                            </div>

                            <div className='col-sm-4 col-md-4'>
                                <div className='huge'>{this.props.dev.status}</div>
                            </div>
                        </div>
                    </div>
                </a>

                <div className='panel-footer'>
                    <div className='row'>
                        <div className='col-sm-4 col-md-4'>
                            <div>Join Time: {month}/{day} - {hour}:{minute}</div>
                        </div>

                        <div className='col-sm-4 col-md-4'>
                            <div>IP: {this.props.dev.ip}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var DevTable = React.createClass({
    render: function () {
        var devsOnRender = [],
            devsOffRender = [];

        _.forEach(this.props.devList, function (dev, clientName) {
            if (dev.status === 'online') {
                devsOnRender.push(
                    <div className='col-sm-12 col-md-12'>
                        <DevBox key='{clientName}' dev={dev} />
                    </div>
                );
            } else {
                devsOffRender.push(
                    <div className='col-sm-12 col-md-12'>
                        <DevBox key='{clientName}' dev={dev} />
                    </div>
                );
            }
        });

        return (
            <div>
                {devsOnRender}
                {devsOffRender}
            </div>
        );
    }
});

function renderDevList() {
    if (!_.isEmpty(devList)) {    
        ReactDOM.render(
            <DevTable devList={devList} />,
            document.getElementById('devTable')
        );
    }
}

renderDevList();
