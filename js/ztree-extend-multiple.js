var CONTEXTPATH = 'http://localhost:8888';
//父节点'
var parentNode = '';
//请求地址
var URL = CONTEXTPATH + '/js/rylb.json';
var mulTreeObj ='';
var $treeId ='';

var multipleTreeHandler = {
        //下拉树搜索方法
    search : function (){
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
            //var zTree = $.fn.zTree.getZTreeObj("tree-dropdownlist");

            var nodeList = [];
            nodeList = mulTreeObj.getNodesByParamFuzzy("name", str, null);
            
            //查找父节点
            for (var i in nodeList) {
                findParent(nodeList[i], nodeList);
            }
            //隐藏所有节点
            emptyNodes(mulTreeObj)
            showNodes(mulTreeObj,nodeList)
        }
    },
    //check事件
    zTreeOnCheck : function (event, treeId, treeNode) {
        //var zTree = $.fn.zTree.getZTreeObj("tree-dropdownlist");
        var nodes =  mulTreeObj.getNodesByFilter(function(nodes){
                return nodes.checked==true;
            }),
        n = "",
        v = "";
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
    },
    beforeClick : function (treeId, treeNode) {
        //var zTree = $.fn.zTree.getZTreeObj("tree-dropdownlist");
        mulTreeObj.checkNode(treeNode, !treeNode.checked, null, true);
        return false;
    },

    zTreeOnClick : function (event, treeId, treeNode){

        //var zTree = $.fn.zTree.getZTreeObj("tree-dropdownlist");
        var nodes =  mulTreeObj.getNodesByFilter(function(nodes){
                return nodes.checked==true;
            }),
        n = "",
        v = "";
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

}
//点击下拉树搜索
var settingMultipleTree = {
    check : {
        enable : true,
        chkStyle : "checkbox",
        chkboxType : {
            "Y" : "",
            "N" : ""
        }
    },
     async : {
        autoParam : [ "value" ],// 异步加载时自动提交父节点参数
        enable : true,// 是否开启异步加载模式
        type : "post",// 提交方式
        url : URL,
    },
    view : {
        showLine : false,
        selectedMulti : false,
        showIcon : false
    },
    data : {
        key : {
            name : "name",
            children: "categories"
        },
        simpleData: {
            enable: true
        }   

    },
    callback : {
        onCheck: multipleTreeHandler.zTreeOnCheck,
        beforeClick: multipleTreeHandler.beforeClick,
    }
};

    function  multipleZtreeInit (treeId,url) {
        if(url){
            URL = CONTEXTPATH + url;
        }
        $treeId = $("#"+treeId);
        //初始化 zTree
        $.fn.zTree.init($treeId, settingMultipleTree);
        mulTreeObj = $.fn.zTree.getZTreeObj(treeId); 
        // 搜索 zTree
        $(".searchInput").bind("propertychange", multipleTreeHandler.search)
            .bind("input", multipleTreeHandler.search);
        //点击展开下拉树 
        $(document).on('click','.search-bar',function(){
            var $this = $(this);
            parentNode = $this.parents('.z-tree-screen'); 
            parentNode.find(".content").show();
            parentNode.find(".searchInput").val('');
            var node = mulTreeObj.getNodesByParam("isHidden", true);
            if(node.length>0){
                mulTreeObj.expandAll(false);
                mulTreeObj.showNodes(node);
                node = mulTreeObj.getNodes();
                mulTreeObj.expandNode(node[0], true);
            }else{
                node = mulTreeObj.getNodes();
                mulTreeObj.expandNode(node[0], true);
            }
            
        })
    }

