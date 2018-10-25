//父节点
var parentNode = '';
//请求地址
var URL = " ";
//内容
var html = '<div class="content"> <ul id="tree-obj" class="ztree"></ul> </div> <div class="content1"> <ul id="tree-obj2" class="ztree"></ul> </div>'; 
$(document).on('mouseover','.tree-button',function(){
    var $this = $(this);
    URL = CONTEXTPATH+$this.attr('data-url'); 
})  

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
                pIdKey : "fjbm",
                rootPId: 0
            },
            key : {
                name : "mc"
            }
        },
        callback: {
            onClick : zTreeOnClick
        }

    };

    
    var keyFlag = true;
    $(document).on("change",".tree-world",function(){
    /*$(".tree-world").change(function(){*/
        var $this = $(this);
        $this.siblings('input').val('');
    })
    $(document).on("keyup",".tree-world",function(){
        var $this = $(this);
        parentNode = $this.parents('.z-tree-screen');

        var URL = CONTEXTPATH+$this.attr('data-url');

        var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;

        var str = $this.val();
        
        if (keyFlag) {
            keyFlag = false;
            setTimeout(function(){
                keyFlag = true;
                if(!reg.test(str)) return;
                 $.ajax({
                    type: "POST",
                    url:  URL,
                    data: "mc="+str,
                    success: function(data){
                        var json = eval("("+data+")");
                        $.fn.zTree.destroy("zTree2");

                        $('.ztree-warp').empty();
                        parentNode.find('.ztree-warp').append(html); 

                        zTree2 = $.fn.zTree.init(parentNode.find("#tree-obj2"), settingInputSearch ,json);
                        parentNode.find(".content").hide();
                        parentNode.find(".content1").show();
                    }
                });
            },300);
        }
    })
   /* $(".tree-world").keyup(function(){*/ 
  
    /*});*/
  
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
            //children: "children"
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
	var treeObj = $.fn.zTree.getZTreeObj("tree-obj");
	treeObj.expandNode(treeNode, true, false , true);
	setTimeout(function(){
		if(treeNode.children && treeNode.children.length==0){ 
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
	},200)
	
	/*var treeObj = $.fn.zTree.getZTreeObj("tree-obj");
	var sNodes = treeObj.getSelectedNodes();*/
	/*if (sNodes.length>0) {
		treeObj.reAsyncChildNodes(sNodes[0], "",false ,function(){ 
			if(sNodes[0].children.length==0){ 
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
		});
	}*/
	 
	
    
}
function zTreeSsztOnClick(event, treeId, treeNode) {
	var treeObj = $.fn.zTree.getZTreeObj("tree-obj");
	treeObj.expandNode(treeNode, true, false , true);
	if(treeNode.ptrees.length==0){ 
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
}

//点击展开下拉树 
$(document).on('click','.tree-button',function(){
    var $this = $(this);
    parentNode = $this.parents('.z-tree-screen'); 

    $('.ztree-warp').empty();
    parentNode.find('.ztree-warp').append(html);   
        $.fn.zTree.destroy("zTree");
        if(parentNode.find('.ztree-warp').hasClass('sszt')){
        	$.fn.zTree.destroy("zTree");
        	zTree = $.fn.zTree.init(parentNode.find("#tree-obj"), settingSszt);
        }else{
        	$.fn.zTree.destroy("zTree");
        	zTree = $.fn.zTree.init(parentNode.find("#tree-obj"), setting);
        } 
        parentNode.find(".content").show();
        parentNode.find(".content1").hide();  
})



$(document).mouseup(function(e){ 
  var _con = $('.ztree-warp .content');   // 设置目标区域
  if(!_con.is(e.target) && _con.has(e.target).length === 0){ // Mark 1
        $('.ztree-warp .content').hide();
  }
})
$(document).mouseup(function(e){
  var _con = $('.ztree-warp .content1');   // 设置目标区域
  if(!_con.is(e.target) && _con.has(e.target).length === 0){ // Mark 1
     $('.ztree-warp .content1').hide();
  }
})
 