var socket = io.connect('http://192.168.1.109:3000/');

socket.on('shepInd', function (ind) {
    var data = ind.data;

    switch (ind.type) {
        case 'dump':
            ReactDOM.render(
                <DevTable devList={data}/>,
                document.getElementById('devTable')
            );
            break;
        case 'registered':
        
            break;
        case 'update':

            break;
        case 'deregistered':

            break;
        case 'online':

            break;   
        case 'offline':

            break;
    }
});

var DevBox = React.createClass({
    getInitialState: function () {
        var boxClassName;

        if(this.props.dev.status === 'online')
            boxClassName = 'panel panel-yellow'
        else
            boxClassName = 'panel panel-green'

        return {
            boxClassName: boxClassName
        }
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
        var devsRender = [];

        _.forEach(this.props.devList, function (dev) {
            devsRender.push(
                <div className='col-sm-12 col-md-12'>
                    <DevBox dev={dev} />
                </div>
            );
        });

        return (
            <div>{devsRender}</div>
        );
    }
});

(function () {
    socket.emit('req', { type: 'dump' });
})();
