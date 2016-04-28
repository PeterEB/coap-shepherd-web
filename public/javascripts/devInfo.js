var socket = io.connect(location.protocol + '//' + location.host);

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
            if (devInfo.clientName === data) {
                devInfo.status = 'online';
                renderDevInfo();
                renderObjList();
            }
            break;   
        case 'offline':
            if (devInfo.clientName === data) {
                devInfo.status = 'offline';
                renderDevInfo();
                renderObjList();
            }
            break;
        case 'notify':
            if (devInfo.clientName === data.device) {
                devInfo.so[data.oid][data.iid][data.rid] = data.data;
                renderObjList();
            }
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
                    <h3> Status: {this.props.dev.status}</h3>
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
    getInitialState: function () {
        var observeSwitch = {
                button: this.onObserveClick,
                value: 'Observe'
            };

        if (devInfo.observeList.indexOf('/' + this.props.oid + '/' + this.props.iid + '/' + this.props.rid) >= 0) {
            observeSwitch.button = this.onCancelObserveClick,
            observeSwitch.value = 'Cancel Observe'
        } else {
            observeSwitch.button = this.onObserveClick,
            observeSwitch.value = 'Observe'
        }

        return {
            writeValue: null,
            execArgs: null,
            attrs: {
                pmin: null,
                pmax: null,
                gt: null,
                lt: null,
                stp: null
            },            
            pminValue: null,
            pmaxValue: null,
            gtValue: null,
            ltValue: null,
            stpValue: null,
            observeSwitch: observeSwitch
        };
    },
    handleWriteChange: function (evt) {
        this.setState({
            writeValue: evt.target.value
        });
    },
    handleExecChange: function (evt) {
        this.setState({
            execArgs: evt.target.value
        });
    },
    handlePminChange: function (evt) {
        if (Number(evt.target.value) || evt.target.value === '' || evt.target.value === '0')
            this.setState({
                pminValue: evt.target.value
            });
    },
    handlePmaxChange: function (evt) {
        if (Number(evt.target.value) || evt.target.value === '' || evt.target.value === '0')
            this.setState({
                pmaxValue: evt.target.value
            });
    },
    handleGtChange: function (evt) {
        if (Number(evt.target.value) || evt.target.value === '' || evt.target.value === '0')
            this.setState({
                gtValue: evt.target.value
            });
    },
    handleLtChange: function (evt) {
        if (Number(evt.target.value) || evt.target.value === '' || evt.target.value === '0')
            this.setState({
                ltValue: evt.target.value
            });
    },
    handleStpChange: function (evt) {
        if (Number(evt.target.value) || evt.target.value === '' || evt.target.value === '0')
            this.setState({
                stpValue: evt.target.value
            });
    },
    onReadClick: function () {
        socket.emit('req', { type: 'read', data: { 
                clientName: devInfo.clientName,
                oid: this.props.oid,
                iid: this.props.iid,
                rid: this.props.rid
            } 
        });
    },
    onWriteClick: function () {
        socket.emit('req', { type: 'write', data: { 
                clientName: devInfo.clientName,
                oid: this.props.oid,
                iid: this.props.iid,
                rid: this.props.rid,
                value: this.state.writeValue
            } 
        });
    },
    onExecClick: function () {
        socket.emit('req', { type: 'execute', data: { 
                clientName: devInfo.clientName,
                oid: this.props.oid,
                iid: this.props.iid,
                rid: this.props.rid,
                value: this.state.execArgs
            } 
        });
    },
    onDiscClick: function () {
        var self = this,
            eventId = 'discover' + ':' + this.props.oid + '/' + this.props.iid + '/' + this.props.rid,
            attrs = {};

        socket.once(eventId, function (ind) {
            _.forEach(ind.data, function (val, key) {
                attrs[key] = val;
            });

            self.setState({
                attrs: attrs
            });
        });

        socket.emit('req', { type: 'discover', data: { 
                clientName: devInfo.clientName,
                oid: this.props.oid,
                iid: this.props.iid,
                rid: this.props.rid
            } 
        });
    },
    onWriteAttrsClick: function () {
        var attrs = {
            pmin: this.state.pminValue,
            pmax: this.state.pmaxValue,
            gt: this.state.gtValue,
            lt: this.state.ltValue,
            stp: this.state.stpValue,
        };

        socket.emit('req', { type: 'writeAttrs', data: { 
                clientName: devInfo.clientName,
                oid: this.props.oid,
                iid: this.props.iid,
                rid: this.props.rid,
                value: attrs
            } 
        });
    },
    onObserveClick: function () {
        var self = this,
            eventId = 'observe' + ':' + this.props.oid + '/' + this.props.iid + '/' + this.props.rid;

        socket.once(eventId, function (ind) {
            self.setState({
                observeSwitch: {
                    button: self.onCancelObserveClick,
                    value: 'Cancel Observe'
                }
            });
        });

        socket.emit('req', { type: 'observe', data: { 
                clientName: devInfo.clientName,
                oid: this.props.oid,
                iid: this.props.iid,
                rid: this.props.rid
            } 
        });
    },
    onCancelObserveClick: function () {
        var self = this,
            eventId = 'cancelObserve' + ':' + this.props.oid + '/' + this.props.iid + '/' + this.props.rid;

        socket.once(eventId, function (ind) {
            self.setState({
                observeSwitch: {
                    button: self.onObserveClick,
                    value: 'Observe'
                }
            });
        });

        socket.emit('req', { type: 'cancelObserve', data: { 
                clientName: devInfo.clientName,
                oid: this.props.oid,
                iid: this.props.iid,
                rid: this.props.rid
            } 
        });
    },
    render: function () {
        var btnClassName = {
                read: 'btn btn-default btn-block disabled',
                write: 'btn btn-default btn-block disabled',
                exec: 'btn btn-default btn-block disabled',
                disc: 'btn btn-default btn-block disabled',
                writeAttrs: 'btn btn-default btn-block disabled',
                observe: 'btn btn-default btn-block disabled'
            },
            collapseId = this.props.oid + '_' + this.props.iid + '_' + this.props.rid,
            collapseHref = '#' + collapseId;

        if (devInfo.status === 'online') {
            if (this.props.val === '_exec_') {
                _.forEach(btnClassName, function (v, k) {
                    btnClassName[k] = 'btn btn-default btn-block disabled';
                });
                btnClassName.exec = 'btn btn-default btn-block'
            } else {
                _.forEach(btnClassName, function (v, k) {
                    btnClassName[k] = 'btn btn-default btn-block';
                });
                btnClassName.exec = 'btn btn-default btn-block disabled'
            }

        } else {
            _.forEach(btnClassName, function (v, k) {
                btnClassName[k] = 'btn btn-default btn-block disabled';
            });
        }

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

                        <div className='col-sm-2 col-md-2'>
                            <div><strong>Attributes</strong></div>
                            <div>pmin: {this.state.attrs.pmin}</div>
                            <div>pmax: {this.state.attrs.pmax}</div>
                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <div>gt: {this.state.attrs.gt}</div>
                            <div>lt: {this.state.attrs.lt}</div>
                            <div>step: {this.state.attrs.stp}</div>
                        </div>
                    </div>
                </div>

                <div className='panel-footer' id='rescOperate'>
                    <div className='row'>
                        <div className='col-sm-2 col-md-2'>
                            <button type="button" className={btnClassName.read} onClick={this.onReadClick} >Read</button>
                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <div className='input-group'>
                                <input type='text' className="form-control" placeholder='' value={this.state.writeValue} onChange={this.handleWriteChange} />
                                <span className='input-group-btn'>
                                    <button type="button" className={btnClassName.write} onClick={this.onWriteClick} >Write</button>
                                </span>
                            </div>
                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <div className='input-group'>
                                <input type='text' className="form-control" placeholder='' value={this.state.execArgs} onChange={this.handleExecChange} />
                                <span className='input-group-btn'>
                                    <button type="button" className={btnClassName.exec} onClick={this.onExecClick} >Execute</button>
                                </span>
                            </div>
                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <button type="button" className={btnClassName.disc} onClick={this.onDiscClick} >Discover</button>
                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <button type="button" className={btnClassName.writeAttrs} data-toggle="collapse" data-target={collapseHref} >
                                Write Attrs 
                                <span className="pull-right"><i className='fa fa-angle-down' /></span>
                            </button>

                        </div>

                        <div className='col-sm-2 col-md-2'>
                            <button type="button" className={btnClassName.observe} onClick={this.state.observeSwitch.button} >{this.state.observeSwitch.value}</button>
                        </div>
                    </div>

                    <div id={collapseId} className="collapse">
                        <br />
                        <div className='row'>
                            <div className='col-sm-2 col-md-2'>
                                <div className="input-group">
                                    <span className="input-group-addon">pmin</span>
                                    <input type="text" className="form-control" placeholder="0" value={this.state.pminValue} onChange={this.handlePminChange} 
                                        data-toggle="tooltip" data-placement="bottom" title="Only enter numbers." />
                                </div>
                            </div>

                            <div className='col-sm-2 col-md-2'>
                                <div className="input-group">
                                    <span className="input-group-addon">pmax</span>
                                    <input type="text" className="form-control" placeholder="60" value={this.state.pmaxValue} onChange={this.handlePmaxChange} 
                                        data-toggle="tooltip" data-placement="bottom" title="Only enter numbers." />
                                </div>
                            </div>

                            <div className='col-sm-2 col-md-2'>
                                <div className="input-group">
                                    <span className="input-group-addon">gt</span>
                                    <input type="text" className="form-control" placeholder="" value={this.state.gtValue} onChange={this.handleGtChange} 
                                        data-toggle="tooltip" data-placement="bottom" title="Only enter numbers." />
                                </div>
                            </div>

                            <div className='col-sm-2 col-md-2'>
                                <div className="input-group">
                                    <span className="input-group-addon">lt</span>
                                    <input type="text" className="form-control" placeholder="" value={this.state.ltValue} onChange={this.handleLtChange} 
                                        data-toggle="tooltip" data-placement="bottom" title="Only enter numbers." />
                                </div>
                            </div>

                            <div className='col-sm-2 col-md-2'>
                                <div className="input-group">
                                    <span className="input-group-addon">step</span>
                                    <input type="text" className="form-control" placeholder="" value={this.state.stpValue} onChange={this.handleStpChange} 
                                        data-toggle="tooltip" data-placement="bottom" title="Only enter numbers." />
                                </div>
                            </div>

                            <div className='col-sm-2 col-md-2'>
                                <button type="button" className={btnClassName.writeAttrs} onClick={this.onWriteAttrsClick} > 
                                    Write Attrs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var InstBox = React.createClass({
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
              <div className="panel panel-yellow">
                <a data-toggle="collapse" data-parent="#instanceTable" href={collapseHref}>
                    <div className="panel-heading">
                        <h4 className="panel-title">
                            {this.props.iid}
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

var ObjBox = React.createClass({
    render: function () {
        var self = this,
            instRender = [],
            collapseId = this.props.oid,
            collapseHref = '#' + collapseId;

        _.forEach(this.props.iObj, function (resList, iid) {
            instRender.push(
                <div>
                    <InstBox oid={self.props.oid} iid={iid} resList={resList} />
                    <br/>
                </div>
            );
        })

        return (
            <div className="panel panel-warning">
                <a data-toggle="collapse" data-parent="#instanceTable" href={collapseHref}>
                    <div className="panel-heading bg-warning">
                        <h4 className="panel-title">
                            {this.props.oid}
                        </h4>
                    </div>
                </a>

                <div id={collapseId} className="panel-collapse collapse">
                    <div className="panel-body" id="instanceTable">
                        {instRender}
                    </div>
                </div>
            </div>
        );
    }
});

var ObjTable = React.createClass({
    render: function () {
        var objRender = [];

        _.forEach(this.props.devSo, function (iObj, oid) {
            objRender.push(
                <div>
                    <ObjBox oid={oid} iObj={iObj} />
                    <br/>
                </div>
            );
        });

        return (
            <div className="panel-group" id="accordion">
                {objRender}
            </div>
        );
    }
});

function renderDevInfo() {
    ReactDOM.render(
        <InfoBox dev={devInfo} />,
        document.getElementById('devInfo')
    );
}

function renderObjList() {
    ReactDOM.render(
        <ObjTable devSo={devInfo.so} />,
        document.getElementById('objList')
    );
}

renderDevInfo();
renderObjList();

$('[data-toggle="tooltip"]').tooltip();
