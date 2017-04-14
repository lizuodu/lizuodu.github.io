;
(function ($) {

    searchTree = function () {
        var treeId = '';
        var $con = $('<div class="searchtree-wrapper"></div>');
        var ctl = [];
        var toolMenuHandler;
        this.initControl = function (props) {
            if (props.style) {
                treeId = '#' + $(this[0]).attr('id');
                $con.attr('style', props.style);
            }
            ctl.push('<div class="searchtree-ser"><input type="text" placeholder="搜索" class="input-sm"/><a class="nodisplay" href="javascript:;"></a></div>');
            ctl.push('<div class="searchtree-dialog-1"><div class="searchtree"></div></div>');
            ctl.push('<div class="searchtree-dialog-2"></div>');
            $con.append(ctl.join(''));
            $(this).append($con);
        };
        var layerNode = [];
        this.getLayerAndEachNode = function (self, arr, index, seed) {
            if (seed >= index)
                return;
            for (var i = 0; i < arr.length; i++) {
                layerNode.push(arr[i].id);
                seed++;
                self(self, arr[i].children, index, seed);
                seed--;
            }
        };
        this.createLayerButton = function (props, eachNodeCall) {
            var layerbtn = [];
            layerbtn.push('<ul>');
            var n = 5;
            for (var i = 1; i <= n; i++) {
                layerbtn.push('<li>' + i + '</li>');
            }
            layerbtn.push('<span>&larr;展开级数</span>');
            layerbtn.push('</ul><i class="tree-refresh fa fa-refresh fa-x"></i>');
            $con.find('.searchtree-dialog-1').prepend(layerbtn.join(''));
            var $dlg1 = $con.find('.searchtree-dialog-1');
            var $dlg2 = $con.find('.searchtree-dialog-2');
            var $se_close = $con.find('.searchtree-ser>a');
            $con.find('input').on({
                focus: function () {
                    $dlg2.removeClass('nodisplay');
                    $dlg1.addClass('nodisplay');
                    $se_close.removeClass('nodisplay');
                }
            });
            $se_close.on('click', function () {
                $dlg1.removeClass('nodisplay');
                $dlg2.addClass('nodisplay').html('');
                $se_close.addClass('nodisplay');
                $con.find('input').val('');
            });
            $con.find('.tree-refresh').on('click', function () {
                $(this).addClass('fa-spin fa-fw');
                $con.find('.searchtree').jstree('destroy');
                if (typeof props.refreshCall === 'function') {
                    props.refreshCall();
                }
                if (props.cache_key.length > 0)
                    setToLocal(props.cache_key, '');
                loadData(props, eachNodeCall);
            });
        };

        function getFromSession(key) {
            if (typeof sessionStorage === 'undefined')
                return JSON.parse('{}');
            else {
                var sessionStr = sessionStorage.getItem(key) || '{}';
                return JSON.parse(sessionStr);
            }
        }
        ;

        function setToSession(key, treeInfoObj) {
            if (typeof sessionStorage === 'undefined')
                return;
            else {
                var sessionStr = getFromSession(key);
                var sessionObj;
                if (typeof sessionObj !== 'undefined') {
                    sessionObj = JSON.parse(sessionStr) || {};
                } else {
                    sessionObj = {
                        nodeid: 0
                    };
                }
                if (typeof treeInfoObj !== 'undefined') {
                    sessionObj.nodeid = treeInfoObj.nodeid || sessionObj.nodeid;
                }
                sessionStorage.setItem(key, JSON.stringify(sessionObj));
            }
        }
        ;

        function getFromLocal(key) {
            var localStr = localStorage.getItem(key);
            if (typeof localStr === 'undefined') {
                localStr = '';
            }
            return localStr;
        }
        ;

        function setToLocal(key, data) {
            try {
                localStorage.setItem(key, data);
            } catch (o) {
            }
        }
        ;

        function mixedData(props, eachNodeCall, data) {
            var objData;
            if (typeof data === 'string') {
                objData = JSON.parse(data) || {};
            } else {
                objData = data;
            }
            if (typeof objData === 'undefined' || objData.length <= 0) {
                props.noDataCall.call(this, 'no data.');
                return;
            }
            $con.find('.searchtree').jstree('destroy');
            var tree = $con.find('.searchtree').jstree({
                'core': {
                    'data': objData,
                    'check_callback': true
                },
                "plugins": ["wholerow", "themes"]
            });
            tree.on('ready.jstree', function (e, d) {
                if (props.expand_all) {
                    d.instance.open_all();
                }
                if (props.expand_first_layer) {
                    layerNode = [];
                    var layer = 1;
                    var treeDataArr = $($con.find('.searchtree')).jstree('get_json'); //tree.get_json();
                    eachNodeCall(eachNodeCall, treeDataArr, layer, 0);
                    $($con.find('.searchtree')).jstree('close_all');
                    for (var j = 0; j < layerNode.length; j++) {
                        $con.find('.searchtree').jstree('open_node', layerNode[j]);
                    }
                    $($con.find('.searchtree-dialog-1>ul li').removeClass('active')[0]).addClass('active');
                }
                $con.find('.searchtree-ser>input[type="text"]').on('keyup', function () {
                    var tree = $($con.find('.searchtree')).jstree();
                    var tree_data = tree._model.data;
                    var search_txt = $(this).val();
                    var $dlg2 = $con.find('.searchtree-dialog-2').html('');
                    var $ul = $('<ul></ul>');
                    var index = 0;
                    $.each(tree_data, function (i, o) {
                        if (typeof o.text !== 'undefined') {
                            if (index < props.search_max_item && o.text.indexOf(search_txt) >= 0) {
                                $ul.append('<li key="' + o.id + '">' + o.text + '</li>');
                                index++;
                            }
                        }
                    });
                    if (index < props.search_max_item) {
                        $ul.append('<li key="0">匹配到' + index + '条记录</li>');
                    } else {
                        $ul.append('<li key="0">只显示最相似的' + props.search_max_item + '条记录</li>');
                    }
                    $dlg2.append($ul);
                    $ul.find('li').on('click', function () {
                        var n = {key: $(this).attr('key'), text: $(this).text()};
                        if (props.search_click)
                            props.searchClick.call(this, n);
                        $con.find('.searchtree-dialog-2').addClass('nodisplay').html('');
                        $con.find('.searchtree-dialog-1').removeClass('nodisplay');
                        tree.deselect_all(true);
                        tree.select_node(n.key);
                    });
                });
                $con.find('.searchtree-dialog-1>ul li').on('click', function () {
                    layerNode = [];
                    var layer = parseInt($(this).text());
                    var treeDataArr = $($con.find('.searchtree')).jstree('get_json');
                    eachNodeCall(eachNodeCall, treeDataArr, layer, 0);
                    $con.find('.searchtree').jstree('close_all');
                    for (var j = 0; j < layerNode.length; j++) {
                        $con.find('.searchtree').jstree('open_node', layerNode[j]);
                    }
                    $con.find('.searchtree-dialog-1>ul li').removeClass('active');
                    $(this).addClass('active');
                });
                var searchTree = getFromSession(props.session_key || '');
                var selectedNode = searchTree.nodeid || 0;
                d.instance.select_node(selectedNode);
                if (props.cache_key.length > 0)
                    setToLocal(props.cache_key, JSON.stringify(objData));
                if (typeof props.initComplete === 'function') {
                    props.initComplete.call(this);
                }
            });
            tree.on('select_node.jstree', function (node, selected, event) {
                var nodeid = selected.node.id || '';
                var nodetxt = selected.node.text || '';
                var parentId = selected.node.parent || '0';
                var nodeattr_level;
                if (typeof selected.node.a_attr !== 'undefined' || typeof selected.node.a_attr.level !== 'undefined') {
                    nodeattr_level = selected.node.a_attr.level || '';
                }
                var item = $(treeId).jstree('get_node', true);
                props.treeNodeClick.call(this, {key: nodeid, text: nodetxt, level: nodeattr_level});
                if (props.tools) {
                    $(node.currentTarget).find('.jstree-item-tools').remove('.jstree-item-tools');
                    var $tools = $('<a href="javascript:;" class="jstree-item-tools"></a>');
                    if (nodeattr_level !== props.no_tools_level) {
                        item.find('.jstree-clicked').after($tools);
                        var $menu = $('<ul class="jstree-item-tools-menu nodisplay"><li class="add">添加</li><li class="modify">修改</li><li class="remove">删除</li></ul>');
                        $(item.find('.jstree-clicked')).after($menu);
                        $tools.unbind('mouseover').on('mouseover', function () {
                            clearTimeout(toolMenuHandler);
                            $menu.removeClass('nodisplay');
                        });
                        $tools.unbind('mouseleave').on('mouseleave', function () {
                            toolMenuHandler = setTimeout(function () {
                                $menu.addClass('nodisplay');
                            }, 100);
                        });
                        $menu.unbind('mouseover').on('mouseover', function () {
                            clearTimeout(toolMenuHandler);
                            $menu.removeClass('nodisplay');
                        });
                        $menu.unbind('mouseleave').on('mouseleave', function () {
                            $menu.addClass('nodisplay');
                        });
                        $menu.find('li').on('click', function () {
                            props.callback.call(this, {
                                key: nodeid,
                                text: nodetxt,
                                level: nodeattr_level,
                                parentId: parentId,
                                action: $(this).attr('class')
                            });
                            $menu.addClass('nodisplay');
                        });
                    }
                }
                if (props.session_key.length > 0)
                    setToSession(props.session_key, {nodeid: nodeid});
            });
        }
        ;

        function loadData(props, eachNodeCall) {
            $.ajax({
                url: props.url,
                type: props.method,
                data: props.data,
                statusCode: {
                    404: function () {},
                    500: function () {
                        //console.log('请求失败，请重新刷新页面');
                    }
                },
                success: function (data) {
                    mixedData(props, eachNodeCall, data);
                    $con.find('.tree-refresh').removeClass('fa-spin fa-fw');
                }
            });
        }
        ;
        this.loadDataAdapter = function (props, eachNodeCall) {
            var data = '';
            if (props.cache_key.length > 0) {
                data = getFromLocal(props.cache_key);
            }
            if (data) {
                mixedData(props, eachNodeCall, data);
            } else {
                loadData(props, eachNodeCall);
            }
        };
    };

    $.fn.searchTree = function (config) {
        this.v = '1.10.0';
        var treeId = '#' + $(this[0]).attr('id');
        if (!$(this).length) {
            return this;
        }
        this.props = {
            url: '',
            method: 'get',
            data: {},
            /* 打开所有节点 */
            expand_all: false,
            /* 打开第一个节点*/
            expand_first_layer: false,
            /* tree样式 */
            style: 'width: 300px;height:400px;',
            /* 树操作按钮 */
            tools: false,
            /* 不显示tools的level */
            no_tools_level: 0,
            /* 搜索结果最大条数 */
            search_max_item: 10,
            /* 启用查询结果回调 */
            search_click: false,
            /* 树缓存key */
            session_key: '',
            cache_key: '',
            /* 控件初始化完成回调 */
            initComplete: function () {},
            /* 没有数据回调 */
            noDataCall: function () {},
            /* 查询列表项点击回调 */
            searchClick: function () {},
            /* 树节点选中 */
            treeNodeClick: function () {},
            /* 刷新树回调 */
            refreshCall: function () {},
            /* 返回操作类型add、modify和remove*/
            callback: function () {}
        };
        this.reloadNode = function (nodeid) { /* 重新加节点 */
            $(this).find('.searchtree').jstree('destroy');
            if (this.props.cache_key.length > 0)
                localStorage.setItem(this.props.cache_key, '');
            this.loadDataAdapter(this.props, this.getLayerAndEachNode);
        };
        this.removeNode = function (nodeid) {
            $(this).find('.searchtree').jstree('delete_node', nodeid);
        };
        this.createNode = function (new_node) {
            $(this).find('.searchtree').jstree('create_node', new_node.parent, new_node, 'last', function () {
                console.log('create success.');
            });
        };
        this.modifyNode = function (node) {
            $(this).find('.searchtree').jstree('rename_node', node, node.text);
        };
        this.props = $.extend({}, this.props, config);
        searchTree.call(this);
        this.initControl(this.props);
        this.createLayerButton(this.props, this.getLayerAndEachNode);
        this.loadDataAdapter(this.props, this.getLayerAndEachNode);
        return this;
    };
})(jQuery);



