/*下拉树组件
   option = {
		selectable：true,
		url：'/common/dict/getOrgTree.do',
		dataKey : {
                name : "name"
            },

   }*/
var ztreeTools = function(treeId,searchId,option) {
    //treeId
    this.treeId = treeId; 
    //searchId
    this.searchId = searchId; 
    this.dataKey = option.dataKey?option.dataKey:{
        name : "name", 
    };
    //配置
    this.setting = {
        check : {
            enable : !option.selectable?option.selectable:true, //是否多选
        },
        async : {
            enable: true,//是否异步
            otherParam : {
				'searchKey' : ""
			},// 异步加载时自动提交父节点参数
            type : "post",// 提交方式
            url : option.url?serviceAddr + option.url:serviceAddr + '/common/dict/getOrgTree.do',
        },
        data : {
			simpleData : {
				enable : true,
				idKey : "id",
				pIdKey : "pId",
				rootPId : 0
			},
			key : option.dataKey?option.dataKey:{
                name : "name", 
            },
		},
        view : {
            showLine : false,
            selectedMulti : false,
            showIcon : false
        },
        view : {
			showIcon : false,
			dblClickExpand : false,
			fontCss : this.getFontCss
		},
        callback : {
            onCheck: this.onCheck,
            onClick: this.onClick,
            beforeClick: !option.selectable?null:this.beforeClick,
            onAsyncSuccess: this.treeId=='cjdwree'?this.zTreeOnAsyncSuccess:null
        }
    };

} 
//click事件
ztreeTools.prototype.getFontCss = function(treeId, treeNode){
	return treeNode.highlight ? {
		color : "#1890ff"
	} : {
		color : "#495060"
	};
}


ztreeTools.prototype.beforeClick = function (treeId, treeNode) {
	zTreeobj = $.fn.zTree.getZTreeObj(treeId);
	zTreeobj.checkNode(treeNode, !treeNode.checked, null, true);
	return false;
}
//click事件
ztreeTools.prototype.onClick = function (e, treeId, treeNode) { 
	var ztreeInputCode = $("#" + treeId).parent().parent().find(
			"[type='hidden']").attr("id");
	var ztreeInputName = $("#" + treeId).parent().parent()
			.find("[type='text']").attr("id");
	if (treeNode.name && treeNode.id) {
		$("#" + ztreeInputName).val(treeNode.name);
		$("#" + ztreeInputCode).val(treeNode.id);
	}
	if (treeNode.mc && treeNode.dm) {
		$("#" + ztreeInputName).val(treeNode.mc);
		$("#" + ztreeInputCode).val(treeNode.dm);
	}
}
//check事件
ztreeTools.prototype.onCheck = function (e, treeId, treeNode) {
	// zTree 的语法取 selectedNode
	var zTree = $.fn.zTree.getZTreeObj(treeId);
	nodes = zTree.getCheckedNodes();

	var id = "";
	var name = "";

	for ( var i in nodes) {
		if (nodes[i].id != null && nodes[i].id != undefined
				&& nodes[i].id != "") {
			id += nodes[i].id + ",";
		}
		if (nodes[i].name != null && nodes[i].name != undefined
				&& nodes[i].name != "") {
			name += nodes[i].name + ",";
		}
		if (nodes[i].dm != null && nodes[i].dm != undefined
				&& nodes[i].dm != "") {
			id += nodes[i].dm + ",";
		}
		if (nodes[i].mc != null && nodes[i].mc != undefined
				&& nodes[i].mc != "") {
			name += nodes[i].mc + ",";
		}

	}
	//判断是否有隐藏节点，拼接选中节点
	if(OtherCheckedNodes){
		id = id + OtherCheckedNodes.id;
		name = name + OtherCheckedNodes.name
	}
	if (id.length > 0)
		id = id.substring(0, id.length - 1);
	if (name.length > 0)
		name = name.substring(0, name.length - 1);
	var ztreeInputCode = $("#" + treeId).parent().siblings("[type='hidden']")
			.attr("id");
	var ztreeInputName = $("#" + treeId).parent().siblings("[type='text']")
			.attr("id");
	$("#" + ztreeInputName).val(name);
	$("#" + ztreeInputCode).val(id);

}
//异步处理字典事件
ztreeTools.prototype.zTreeOnAsyncSuccess = function  (){
	var treeObj = $.fn.zTree.getZTreeObj('cjdwree');
	var nodes = treeObj.getNodes();
	
	$(nodes).each(function(i,n){
		console.log(nodes[i])
		if(i!=0){
			console.log(nodes[i])
			treeObj.hideNode(nodes[i]);
		}
	})

}
//通过sql过滤查询
function searchBySql(zTreeutil) {
	//var $zTreeutil = e.data.zTreeutil; 
	var $zTreeutil = zTreeutil;
	$zTreeutil.setting.async.otherParam = {
		'searchKey' : $("#" + $zTreeutil.searchId).val()
	};
	$.fn.zTree.init($("#" + $zTreeutil.treeId), $zTreeutil.setting);

}

// 通过前端过滤查询
function searchNodeByJs(zTreeutil) {
	//var $zTreeutil = e.data.zTreeutil; 
	var $zTreeutil = zTreeutil;
	var mulTreeObj = $.fn.zTree.getZTreeObj($zTreeutil.treeId);
	var str = $("#" + $zTreeutil.searchId).val();
	var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
	if (str == "" || str == null) {
		OtherCheckedNodes = '';
		var nodes = mulTreeObj.getNodesByParam("isHidden", true);
		mulTreeObj.showNodes(nodes);
	} else {
		
		// 判断找到该节点后展示
		// 存储查询的值
		var nodeList = [];
		if (!reg.test(str)){
			nodeList = mulTreeObj.getNodesByParamFuzzy($zTreeutil.dataKey.key, str, null);
		}else{
			nodeList = mulTreeObj.getNodesByParamFuzzy($zTreeutil.dataKey.name, str, null);
		}

		// 查找父节点
		// 查找父节点
		$(nodeList).each(function(i,n){
			findParent(nodeList[i], nodeList);
		})
		//查找所有选中的隐藏节点
		OtherCheckedNodes = findOtherNodes(mulTreeObj,nodeList);
		// 隐藏所有节点
		emptyNodes(mulTreeObj);
		showNodes(mulTreeObj, nodeList);
	}
}

//通过前端过滤查询（解决字典错误）
function searchNodeByJsCheck(zTreeutil) {
	//var $zTreeutil = e.data.zTreeutil; 
	var $zTreeutil = zTreeutil;
	var mulTreeObj = $.fn.zTree.getZTreeObj($zTreeutil.treeId);
	var str = $("#" + $zTreeutil.searchId).val();
	var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
	if (str == "" || str == null) {
		OtherCheckedNodes = '';
		$zTreeutil.setting.async.otherParam = {
				'searchKey' : $("#" + $zTreeutil.searchId).val()
			};
		$.fn.zTree.init($("#" + $zTreeutil.treeId), $zTreeutil.setting);
	} else {
		
		// 判断找到该节点后展示
		// 存储查询的值
		var nodeList = [];
		if (!reg.test(str)){
			nodeList = mulTreeObj.getNodesByParamFuzzy($zTreeutil.dataKey.key, str, null);
		}else{
			nodeList = mulTreeObj.getNodesByParamFuzzy($zTreeutil.dataKey.name, str, null);
		}

		// 查找父节点
		// 查找父节点
		$(nodeList).each(function(i,n){
			findParent(nodeList[i], nodeList);
		})
		//查找所有选中的隐藏节点
		OtherCheckedNodes = findOtherNodes(mulTreeObj,nodeList);
		// 隐藏所有节点
		emptyNodes(mulTreeObj);
		showNodes(mulTreeObj, nodeList);
	}
}
// 隐藏所有节点
function emptyNodes(treeObj) {
	var node = treeObj.getNodesByFilter(function(node) {
		return node;
	})
	// 隐藏所有节点
	treeObj.hideNodes(node);
}
// 查找父级节点
function findParent(treeNode, searchArr) {
	// 递归显示父级节点
	var pNode = treeNode.getParentNode();
	if (pNode != null) {
		searchArr.push(pNode);
		findParent(pNode, searchArr);
	}
}
//查找所有隐藏节点
function findOtherNodes(treeObj,searchArr){
	var otherNodes = [];
	var nodes = treeObj.getNodes();
	for(var j in searchArr){
		for (var i in nodes) {
			if (nodes[i].id&&nodes[i].id != searchArr[j].id) {
				otherNodes.push(nodes[i])
			}
			if (nodes[i].dm&&nodes[i].dm != searchArr[j].dm) {
				otherNodes.push(nodes[i])
			}
		}
	}
	// 数组去重
	var hash = {};
	otherNodes = otherNodes.reduce(function(item, next) {
		if(next.name){
			hash[next.name] ? '' : hash[next.name] = true && item.push(next);
			return item
		}
		if(next.mc){
			hash[next.mc] ? '' : hash[next.mc] = true && item.push(next);
			return item
		}
		
	}, []);
	
 
	var id = "",
	name = "";
	$.each(otherNodes,function(i,n){
		if(otherNodes[i].checked==true){
			if (otherNodes[i].id != null && otherNodes[i].id != undefined
					&& otherNodes[i].id != "") {
				id += otherNodes[i].id + ",";
			}
			if (otherNodes[i].name != null && otherNodes[i].name != undefined
					&& otherNodes[i].name != "") {
				name += otherNodes[i].name + ",";
			}
			if (otherNodes[i].dm != null && otherNodes[i].dm != undefined
					&& otherNodes[i].dm != "") {
				id += otherNodes[i].dm + ",";
			}
			if (otherNodes[i].mc != null && otherNodes[i].mc != undefined
					&& otherNodes[i].mc != "") {
				name += otherNodes[i].mc + ",";
			}
		}
	})
	//取出隐藏选中的值
 
	var checkedNode = {
		'id':id,
		'name':name
	}
	return checkedNode
}
// 展示节点
function showNodes(mulTreeObj, node) { 
	if (node.length > 0) {
		// 展开查询到的节点的子节点
		mulTreeObj.expandNode(node[0], true);
	}
	// 数组去重
	var hash = {};
	node = node.reduce(function(item, next) {
		hash[next.name] ? '' : hash[next.name] = true && item.push(next);
		return item
	}, []);

	mulTreeObj.showNodes(node);
}


/**
 * ------New----- 树初始化方法： ztreeId：树id ztreeSearchId：搜索框inputId
 * ztreeId：显示下拉树的容器id
 * ztreeSearchId：搜索框的id 
 * ztreeOption：初始化下拉树的其他属性配置
   ztreeOption = {
		selectable：true,
		url：'/common/dict/getOrgTree.do',
		dataKey : {
                name : "name"
            },
        nodeList : {}    
   }
 */
function initOrgTreeFun(ztreeId, ztreeSearchId, ztreeOption) {
	// 初始化ztreeTools
    var $zTreeutil = new ztreeTools (ztreeId,ztreeSearchId,ztreeOption); 
	$.fn.zTree.init($("#" + ztreeId), $zTreeutil.setting);
	// 初始化过滤搜索
	//$('#' + ztreeSearchId).bind("propertychange",{'zTreeutil':$zTreeutil},searchBySql).bind("input",{'zTreeutil':$zTreeutil},searchBySql);
	// 设置延时，防止中文未输入完就进行搜索，解决卡顿问题
	var flag = true;
	$('#' + ztreeSearchId).on('compositionstart', function() {
		flag = false;
	})
	$('#' + ztreeSearchId).on('compositionend', function() {
		flag = true;
	})
	var serachtimer;
	$('#' + ztreeSearchId).on('input', function() {
		var _this = this;
		clearTimeout(serachtimer);
		serachtimer = setTimeout(function() {
			if (flag) {
				searchNodeByJs($zTreeutil)
			}
		}, 1000)
	})
}

function initOrgTreeFunByJs(ztreeId, ztreeSearchId, ztreeOption) {
	// 初始化ztreeTools
    var $zTreeutil = new ztreeTools (ztreeId,ztreeSearchId,ztreeOption); 
	$.fn.zTree.init($("#" + ztreeId), $zTreeutil.setting, ztreeOption.nodeList);
	// 初始化过滤搜索
	//$('#' + ztreeSearchId).bind("propertychange",{'zTreeutil':$zTreeutil},searchNodeByJs).bind("input",{'zTreeutil':$zTreeutil},searchNodeByJs);
	// 设置延时，防止中文未输入完就进行搜索，解决卡顿问题
	var flag = true;
	$('#' + ztreeSearchId).on('compositionstart', function() {
		flag = false;
	})
	$('#' + ztreeSearchId).on('compositionend', function() {
		flag = true;
	})
	var serachtimer;
	$('#' + ztreeSearchId).on('input', function() {
		var _this = this;
		clearTimeout(serachtimer);
		serachtimer = setTimeout(function() {
			if (flag) {
				searchNodeByJs($zTreeutil)
			}
		}, 1000)
	})
}

/**
 *解决现场字典错误，过滤多余节点
 * ------New----- 树初始化方法： ztreeId：树id ztreeSearchId：搜索框inputId
 * ztreeId：显示下拉树的容器id
 * ztreeSearchId：搜索框的id 
 * ztreeOption：初始化下拉树的其他属性配置
   ztreeOption = {
		selectable：true,
		url：'/common/dict/getOrgTree.do',
		dataKey : {
                name : "name"
            },
        nodeList : {}    
   }
 */
function initOrgTreeFunCheck(ztreeId, ztreeSearchId, ztreeOption) {
	// 初始化ztreeTools
    var $zTreeutil = new ztreeTools (ztreeId,ztreeSearchId,ztreeOption); 

	// 初始化 zTree
	$.fn.zTree.init($("#" + ztreeId), $zTreeutil.setting);
	// 初始化过滤搜索
	//$('#' + ztreeSearchId).bind("propertychange",{'zTreeutil':$zTreeutil},searchNodeByJsCheck).bind("input",{'zTreeutil':$zTreeutil},searchNodeByJsCheck);
	//$('#' + ztreeSearchId).bind("propertychange",{'zTreeutil':$zTreeutil},searchBySql).bind("input",{'zTreeutil':$zTreeutil},searchBySql);
	
	// 设置延时，防止中文未输入完就进行搜索，解决卡顿问题
	var flag = true;
	$('#' + ztreeSearchId).on('compositionstart', function() {
		flag = false;
	})
	$('#' + ztreeSearchId).on('compositionend', function() {
		flag = true;
	})
	var serachtimer;
	$('#' + ztreeSearchId).on('input', function() {
		var _this = this;
		clearTimeout(serachtimer);
		serachtimer = setTimeout(function() {
			if (flag) {
				searchNodeByJsCheck($zTreeutil)
			}
		}, 1000)
	})
}
