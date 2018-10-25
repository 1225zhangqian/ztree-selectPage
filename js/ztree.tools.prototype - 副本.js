
var CONTEXTPATH = 'http://localhost:8888'; 
//存储数据格式
var dataKeys = [{"treeId": "Primary",
                "dataKey":{
                    name : "name", 
                    children: "categories"
                }
                }];
                
//组件
var ztreeTools = function(treeId,url,selectable,async,dataKey) {
    //treeId
    this.treeId = treeId;  
    //url 
    this.url = CONTEXTPATH + url;  
    //配置
    this.setting = {
        check : {
            enable : !selectable?selectable:true, //是否多选
        },
        async : {
            enable: !async?async:true,//是否异步
            autoParam : [ "value" ],// 异步加载时自动提交父节点参数
            enable : true,// 是否开启异步加载模式
            type : "post",// 提交方式
            url : this.url,
        },
        view : {
            showLine : false,
            selectedMulti : false,
            showIcon : false
        },
        data : {
            key : dataKey?dataKey:{
                name : "name", 
                children: "categories"
            },
            simpleData: {
                enable: true
            }   

        },
        callback : {
            onCheck: this.onCheck,
            onClick: this.onClick,
            beforeClick: !selectable?null:this.beforeClick,
        }
    };
    this.dataKey =  dataKey;
} 
//click事件
ztreeTools.prototype.onClick = function(event, treeId, treeNode){
    var treeNode = changeName (treeId,treeNode,dataKeys)
    if(treeNode.name){ 
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').val(treeNode.name);
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').attr('title',treeNode.name);
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-input').val(treeNode.value); 
    }else{
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').val('');
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').attr('title','');
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-input').val('');         
    }
}
//用于捕获单击节点之前的事件回调函数，并且根据返回值确定是否允许单击操作
ztreeTools.prototype.beforeClick = function (treeId, treeNode) { 
    zTreeobj = $.fn.zTree.getZTreeObj(treeId);
    zTreeobj.checkNode(treeNode, !treeNode.checked, null, true);
    return false;
};
//check事件
ztreeTools.prototype.onCheck = function(event, treeId, treeNode){
    zTreeobj = $.fn.zTree.getZTreeObj(treeId);
    var nodes = zTreeobj.getNodesByFilter(function(nodes){
            return nodes.checked==true;
        }),
    n = "",
    v = "";
    nodes = changeName (treeId,nodes,dataKeys)
    for (var i=0, l=nodes.length; i<l; i++) {
                n += nodes[i].name + ",";
                v += nodes[i].value + ",";
            }
    if (v.length > 0 ){
        n = n.substring(0, n.length-1); 
        v = v.substring(0, v.length-1);
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').val(n);
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').attr('title',n);
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-input').val(v); 
    }else{
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').val('');
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').attr('title','');
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-input').val('');         
    }
}
//查询内容
ztreeTools.prototype.searchNode = function(e){ 
        var $this = $(this);
        parentNode = $this.parents('.z-tree-screen');

        var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;

        var str = $this.val();
        if(str==""||str==null){
            parentNode.find(".search-bar").click();
        }else{
            if(!reg.test(str)) return;
            //判断找到该节点后展示
            //存储查询的值
            var zTree = e.data.zTree; 
            var nodeList = [];
            nodeList = zTree.getNodesByParamFuzzy("name", str, null); 
            //查找父节点
            for (var i in nodeList) {
                findParent(nodeList[i], nodeList);
            }
            //隐藏所有节点
            emptyNodes(zTree)
            showNodes(zTree,nodeList)

        }
    } 
//异步查询内容
ztreeTools.prototype.ztreeAsyncSearch = function(e){ 
        var $this = $(this);
        parentNode = $this.parents('.z-tree-screen');

        var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;

        var str = $this.val();
        if(str==""||str==null){
            parentNode.find(".search-bar").click();
        }else{
            if(!reg.test(str)) return;
            //判断找到该节点后展示
            $.ajax({
                 type: "POST",
                 url:  e.data.searchUrl,
                 data: "mc="+str,
                 success: function(data){
                    //var json = eval("("+data+")");
                    $.fn.zTree.destroy(e.data.treeId); 
                    zTree = $.fn.zTree.init(parentNode.find("#"+e.data.treeId), e.data.setting ,data); 
                }
            });
        }
    } 

ztreeTools.prototype.ztreeShowClick = function(treeId,$zTreeutil,nodeList){
    var $treeId = $("#"+treeId);  
    var $ztreeWrap = $treeId.parents('.z-tree-screen'); 
    //点击展开下拉树  
    $ztreeWrap.find('.search-bar').click(function(){
        //清除搜索框内容
        $treeId.siblings('#searchInput').val('');    
        //展示下拉框
        $ztreeWrap.find(".content").show();
        $ztreeWrap.find(".page-content-wrap").show();
        $.fn.zTree.destroy(treeId);
        //初始化 zTree  
        var treeObj;
        if(nodeList&&nodeList.length!=0){
            treeObj = $.fn.zTree.init($treeId, $zTreeutil.setting,nodeList);
        }else{
            treeObj = $.fn.zTree.init($treeId, $zTreeutil.setting);
        }
         
        var node = treeObj.getNodesByParam("isHidden", true);
        if(node.length>0){
            treeObj.expandAll(false);
            treeObj.showNodes(node);
            node = treeObj.getNodes();
            treeObj.expandNode(node[0], true);
        }else{
            node = treeObj.getNodes();
            treeObj.expandNode(node[0], true);
        }
    })
}

var pageUtil = function (pageId,nodeList,$zTreeutil){
    this.pageId = pageId;
    this.currentNum = 1;
    this.pagesize = 5; 
    this.totalPageNo = nodeList.length; 
    this.changeStyle = function(){
        var _this = this;
        //置灰首页样式
        if(_this.currentNum==1){
            //置灰首页和上一页
            _this.pageId.find('.first-btn').addClass('disabled-btn')
            _this.pageId.find('.pre-btn').addClass('disabled-btn')
            _this.pageId.find('.last-btn').removeClass('disabled-btn')
            _this.pageId.find('.next-btn').removeClass('disabled-btn')
        }else if(_this.currentNum==_this.totalPageNo){
            //置灰末页和下一页
            _this.pageId.find('.last-btn').addClass('disabled-btn')
            _this.pageId.find('.next-btn').addClass('disabled-btn')
            _this.pageId.find('.first-btn').removeClass('disabled-btn')
            _this.pageId.find('.pre-btn').removeClass('disabled-btn')
        }else{
            _this.pageId.find('.first-btn').removeClass('disabled-btn')
            _this.pageId.find('.pre-btn').removeClass('disabled-btn')
            _this.pageId.find('.last-btn').removeClass('disabled-btn')
            _this.pageId.find('.next-btn').removeClass('disabled-btn')
        }
    };
    this.pagination = function(){
        var _this = this;
        var firstBtn
        //首页
        /*$(document).on('click','.first-btn',function(){  
            if(_this.pageId.find('.first-btn').hasClass('disabled-btn'))return;
            _this.currentNum = 1; 
            $.fn.zTree.init($('#'+$zTreeutil.treeId), $zTreeutil.setting,nodeList[0]);
            _this.pageId.find('.pageMsg').html(`第`+_this.currentNum+`页(共`+_this.totalPageNo+`页)`)
            _this.changeStyle()
        })*/
        _this.pageId.find('.first-btn').on('click',function(){  
            if(_this.pageId.find('.first-btn').hasClass('disabled-btn'))return;
            _this.currentNum = 1; 
            $.fn.zTree.init($('#'+$zTreeutil.treeId), $zTreeutil.setting,nodeList[0]);
            _this.pageId.find('.pageMsg').html(`第`+_this.currentNum+`页(共`+_this.totalPageNo+`页)`)
            _this.changeStyle()
        })
        //末页
        /*$(document).on('click','.last-btn',function(){  
            if(_this.pageId.find('.last-btn').hasClass('disabled-btn'))return;
            _this.currentNum = _this.totalPageNo; 
            $.fn.zTree.init($('#'+$zTreeutil.treeId), $zTreeutil.setting,nodeList[_this.totalPageNo-1]);
            _this.pageId.find('.pageMsg').html(`第`+_this.currentNum+`页(共`+_this.totalPageNo+`页)`)
            _this.changeStyle()

        })*/
        _this.pageId.find('.last-btn').on('click',function(){  
            if(_this.pageId.find('.last-btn').hasClass('disabled-btn'))return;
            _this.currentNum = _this.totalPageNo; 
            $.fn.zTree.init($('#'+$zTreeutil.treeId), $zTreeutil.setting,nodeList[_this.totalPageNo-1]);
            _this.pageId.find('.pageMsg').html(`第`+_this.currentNum+`页(共`+_this.totalPageNo+`页)`)
            _this.changeStyle()

        })
        //上一页
        /*$(document).on('click','.pre-btn',function(){
            if(_this.pageId.find('.pre-btn').hasClass('disabled-btn'))return;
            _this.currentNum--;   
            $.fn.zTree.init($('#'+$zTreeutil.treeId), $zTreeutil.setting,nodeList[_this.currentNum-1]);
            _this.pageId.find('.pageMsg').html(`第`+_this.currentNum+`页(共`+_this.totalPageNo+`页)`) 
            _this.changeStyle()
        }) */
        _this.pageId.find('.pre-btn').on('click',function(){
            if(_this.pageId.find('.pre-btn').hasClass('disabled-btn'))return;
            _this.currentNum--;   
            $.fn.zTree.init($('#'+$zTreeutil.treeId), $zTreeutil.setting,nodeList[_this.currentNum-1]);
            _this.pageId.find('.pageMsg').html(`第`+_this.currentNum+`页(共`+_this.totalPageNo+`页)`) 
            _this.changeStyle()
        }) 
        //下一页
        /*$(document).on('click','.next-btn',function(){
            if(_this.pageId.find('.next-btn').hasClass('disabled-btn'))return;
            _this.currentNum++;   
            $.fn.zTree.init($('#'+$zTreeutil.treeId), $zTreeutil.setting,nodeList[_this.currentNum-1]);
            _this.pageId.find('.pageMsg').html(`第`+_this.currentNum+`页(共`+_this.totalPageNo+`页)`) 
            _this.changeStyle()
        }) */
        _this.pageId.find('.next-btn').on('click',function(){
            if(_this.pageId.find('.next-btn').hasClass('disabled-btn'))return;
            _this.currentNum++;   
            $.fn.zTree.init($('#'+$zTreeutil.treeId), $zTreeutil.setting,nodeList[_this.currentNum-1]);
            _this.pageId.find('.pageMsg').html(`第`+_this.currentNum+`页(共`+_this.totalPageNo+`页)`) 
            _this.changeStyle()
        })  
    }
}



function ztreeToolsInit (treeId,url,selectable,nodeList,async,dataKey,searchUrl){
    // 初始化ztreeTools
    var $zTreeutil = new ztreeTools (treeId,url,selectable,async,dataKey); 
    var $treeId = $("#"+treeId); 
    var $ztreeWrap = $treeId.parents('.z-tree-screen'); 
    //初始化 zTree 
    var zTree;
    if(nodeList&&nodeList.length!=0){
        zTree = $.fn.zTree.init($treeId, $zTreeutil.setting,nodeList);
    }else{
        zTree = $.fn.zTree.init($treeId, $zTreeutil.setting);
    }
    //添加data类型
    if(dataKey){
        var dataKeytemp = {
        "treeId": treeId,
        "dataKey" : dataKey
        }
    }
    dataKeys.push(dataKeytemp);

    // 搜索 zTree
    if(!async){
       $ztreeWrap.find(".searchInput").bind("propertychange",{zTree:zTree}, $zTreeutil.searchNode)
            .bind("input",{zTree:zTree}, $zTreeutil.searchNode);
    }else{
        var asyncArr = {
            "treeId" : treeId,
            "searchUrl" : searchUrl,
            "setting" : $zTreeutil.setting
        };
        $ztreeWrap.find(".searchInput").bind("propertychange",asyncArr, $zTreeutil.ztreeAsyncSearch)
            .bind("input",asyncArr, $zTreeutil.ztreeAsyncSearch);
    }
    //点击树的方法
    $zTreeutil.ztreeShowClick(treeId,$zTreeutil,nodeList)
}

function selectPageInit(treeId,url,nodeList){
    var $treeId = $('#'+treeId);
    //初始化样式
/*    var $ztreeWarp = $treeId.parents('.ztree-warp');
    var html =`<div class="page-content-wrap">  
        <div class="ztree-content">
            <input class="searchInput">
            <ul id="`+treeId+`" class="ztree"></ul>  
        </div> 
        <div class="page-footer clearfix"> 
            <span class="btn first-btn "><<</span><span class="btn pre-btn "><</span>
            <span class="pageMsg">第`+1+`页(共`+3+`页)</span>
            <span class="btn next-btn ">></span><span class="btn last-btn ">>></span> 
        </div>
    </div> `;
    $ztreeWarp.empty();
    $ztreeWarp.append(html);*/
    
    // 初始化ztreeTools
    var $zTreeutil = new ztreeTools(treeId,url,false,false); 
    // 初始化树
    var treeObj = $.fn.zTree.init($treeId, $zTreeutil.setting);
    nodeList = getPageList (nodeList,nodeList.length,5)
    $zTreeutil.ztreeShowClick(treeId,$zTreeutil,nodeList[0])
    //初始化分页
    var $pageFooter = $treeId.parents('.page-content-wrap').find('.page-footer');
    var $pageUtil = new pageUtil($pageFooter,nodeList,$zTreeutil);
    $pageUtil.pagination();
}

