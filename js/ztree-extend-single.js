var CONTEXTPATH = 'http://localhost:8888';
//父节点
var parentNode = '';
//请求地址
var URL = " ";
//键盘录入搜索
var settingInputSearch = {
        check: {
            enable: false,
            // chkboxType: {"Y":"", "N":""}
        },
        view : {
            showLine : false,
            selectedMulti : true,
        },
        data : {
            simpleData : {
                idKey : "bm",
                pIdKey : "fjbm", rootPId: 0
            },
            key : {
                name : "mc"
            }
        },
        callback: {
            onClick : zTreeOnClick
        }

    };
  
    function searchNode(){
    	 var $this = $(this);
    	 var $searchBar = parentNode.find('.search-bar');
    	 var $treeWorld = parentNode.find('.tree-world');
         parentNode = $this.parents('.z-tree-screen');

         var URL = CONTEXTPATH+ $treeWorld.attr('data-url');

         var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
         var regEng = /[a-zA-Z]/;

         var str = $this.val();
         if(str==""||str==null){
         	$searchBar.click();
         }else{ 
                 if(!reg.test(str)||regEng.test(str)) return;
                  $.ajax({
                     type: "POST",
                     url:  URL,
                     data: "mc="+str,
                     success: function(data){
                         //var json = eval("("+data+")");
                         $.fn.zTree.destroy("zTree"); 
                         zTree = $.fn.zTree.init(parentNode.find("#tree-obj"), settingInputSearch ,data); 
                     }
                 }); 
         }
    } 
  
//点击下拉树搜索
var setting = {
    check : {
        //enable : true,
        //chkStyle : "checkbox",
        chkboxType : {
            "Y" : "",
            "N" : ""
        }
    },
     async : {
        autoParam : [ "bm" ],// 异步加载时自动提交父节点参数
        enable : true,// 是否开启异步加载模式
        type : "post",// 提交方式
        url : function(treeId){
            return URL
        },
    },
    view : {
        showLine : false,
        selectedMulti : false,
    },
    data : {
        key : {
            name : "mc",
            // children: "children"
        },

    },
    callback : {
        //onAsyncSuccess : zTreeOnAsyncSuccess,
        //onCheck: onCheck,
        onClick : zTreeOnClick
    }
};

  //点击所属专题下拉树搜索
    var settingSszt = {
         async : {
            autoParam : [ "value" ],// 异步加载时自动提交父节点参数
            enable : true,// 是否开启异步加载模式
            type : "post",// 提交方式
            url : function(treeId){
                return URL
            },
        },
        view : {
            showLine : false,
            selectedMulti : false,
            showIcon : false
        },
        data : {
            key : {
                name : "text",
                children: "ptrees"
            },
            simpleData: {
                enable: true
            }   

        },
        callback : {
            onClick: zTreeSsztOnClick
        }
    };
function zTreeOnClick(event, treeId, treeNode) {
     
    if(treeNode.bm){ 
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').val(treeNode.mc);
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').attr('title',treeNode.mc);
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-input').val(treeNode.bm); 
    }else{
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').val('');
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').attr('title','');
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-input').val('');         
    }
}
function zTreeSsztOnClick(event, treeId, treeNode) {
    
    if(treeNode.value){ 
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').val(treeNode.text);
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').attr('title',treeNode.text);
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-input').val(treeNode.value); 
    }else{
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').val('');
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-world').attr('title','');
        $(event.currentTarget).parents('.z-tree-screen').find('.tree-input').val('');         
    }
}

//点击展开下拉树 
$(document).on('click','.search-bar',function(){
    var $this = $(this);
    URL = CONTEXTPATH+$this.find('.tree-button').attr('data-url'); 
    parentNode = $this.parents('.z-tree-screen'); 

    $.fn.zTree.destroy("zTree");
    if(parentNode.find('.ztree-warp').hasClass('sszt')){
    	zTree = $.fn.zTree.init(parentNode.find("#tree-obj"), settingSszt);
    }else{
    	zTree = $.fn.zTree.init(parentNode.find("#tree-obj"), setting);
    } 
    parentNode.find(".content").show();   
})
//搜索下拉框
$(document).on('propertychange','.searchInput',searchNode);
$(document).on('input','.searchInput',searchNode);

$(document).mouseup(function(e){ 
  var _con = $('.ztree-warp .content');   // 设置目标区域
  if(!_con.is(e.target) && _con.has(e.target).length === 0){ // Mark 1
        $('.ztree-warp .content').hide();
  }
}) 