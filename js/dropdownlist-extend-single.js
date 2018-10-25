var CONTEXTPATH = 'http://localhost:8888';
//父节点'
var parentNode = '';
var treeObj ='';
var $treeId ='';
//请求地址
var URL = CONTEXTPATH + '/js/dropdownlist.json';

var dropdownlistHandler = {
    //下拉树搜索方法
    search : function(){
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
            nodeList = treeObj.getNodesByParamFuzzy("name", str, null); 
            //隐藏所有节点
            emptyNodes(treeObj) 
            treeObj.showNodes(nodeList);
        }
    },
        //check事件
    zTreeonClick : function (event, treeId, treeNode) {
        
        n = treeNode.name,
        v = treeNode.value; 
        if (v.length > 0 ){ 
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

//下拉树配置
var settingDropdownlist = {
    check : {
        enable : false, 
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
        simpleData: {
            enable: true
        },
        key:{
        name:'name'
    },

    },
    
    callback : {
        onClick: dropdownlistHandler.zTreeonClick
    }
};

function  dropdownlistInit (treeId,url) {
    URL = CONTEXTPATH + url;
    var $treeId = $("#"+treeId);
    //初始化 zTree
    $.fn.zTree.init($treeId, settingDropdownlist);
    // 搜索 zTree
    $(".searchInput").bind("propertychange", dropdownlistHandler.search)
        .bind("input", dropdownlistHandler.search);
    //点击展开下拉树 
    $(document).on('click','.search-bar',function(){
        $(".searchInput").val('');
        var $this = $(this);
        parentNode = $this.parents('.z-tree-screen'); 
        parentNode.find(".content").show();
        treeObj = $.fn.zTree.getZTreeObj(treeId); 
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
