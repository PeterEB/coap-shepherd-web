var socket = io.connect('http://192.168.1.109:3000/');

socket.on('shepInd', function (ind) {
    var data = ind.data;

    switch (ind.type) {
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

var InfoBox = React.createClass({
    render: function () {
        var joinTime = new Date(this.props.dev.joinTime),
            month = joinTime.getUTCMonth(),
            day = joinTime.getUTCDate(),
            hour = joinTime.getUTCHours(),
            minute = joinTime.getUTCMinutes();

        if (month < 10)
            month = '0' + month;

        if (day < 10)
            day = '0' + day;

        if (hour < 10)
            hour = '0' + hour;    

        if (minute < 10)
            minute = '0' + minute;

        return (
            <div className='row'>
                <div className='col-sm-3 col-md-3'>
                    <h3> Status: {this.props.dev.status} </h3>
                </div>

                <div className='col-sm-4 col-md-4'>
                    <h3> Join Time: {month}/{day} - {hour}:{minute}</h3>
                </div>

                <div className='col-sm-4 col-md-4'>
                    <h3>IP: {this.props.dev.ip}</h3>
                </div>
            </div>
        );
    }
});

var ResBox = React.createClass({
    render: function () {

        return (        
            <div className='panel panel-primary'>
                <div className='panel-heading'>
                    <div className='row'>
                        <div className='col-sm-4 col-md-4'>
                            <div className='huge'>{this.props.rid}</div>
                        </div>

                        <div className='col-sm-4 col-md-4'>
                            <div className='huge'>{this.props.val}</div>
                        </div>
                    </div>
                </div>

                <div className='panel-footer'>
                    <div className='row'>
                        <div className='col-sm-2 col-md-2'>
                            <div>read</div>
                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <div>write</div>
                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <div>execute</div>
                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <div>discover</div>
                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <div>write Attr</div>
                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <div>observe</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var ObjBox = React.createClass({
    render: function () {
        var self = this,
            resRender = [],
            collapseId = this.props.oid + '_' + this.props.iid,
            collapseHref = '#' + collapseId;

        _.forEach(this.props.resList, function (val, rid) {
            resRender.push(
                <div>
                    <ResBox oid={self.props.oid} iid={self.props.iid} rid={rid} val={val} />
                    <br/>
                </div>
            )
        });

        return (
            <div>
              <div className="panel panel-red">
                <a data-toggle="collapse" data-parent="#accordion" href={collapseHref}>
                    <div className="panel-heading">
                      <h4 className="panel-title">
                          {this.props.oid}/{this.props.iid}
                      </h4>
                    </div>
                </a>
                <div id={collapseId} className="panel-collapse collapse">
                    <div className="panel-body">
                        {resRender}
                    </div>
                </div>
              </div>
            </div>
        );
    }
});

var ObjTable = React.createClass({
    render: function () {
        var objRender = [],
            oidTemp;

        _.forEach(this.props.devSo, function (iObj, oid) {
            oidTemp = oid;
            _.forEach(iObj, function (resList, iid) {
                objRender.push(
                    <div>
                        <ObjBox oid={oidTemp} iid={iid} resList={resList} />
                        <br/>
                    </div>
                );
            })
        });

        return (
            <div className="panel-group" id="accordion">
                {objRender}
            </div>
        );
    }
});

ReactDOM.render(
    <InfoBox dev={devInfo} />,
    document.getElementById('devInfo')
);

ReactDOM.render(
    <ObjTable devSo={devInfo.so} />,
    document.getElementById('objList')
);
