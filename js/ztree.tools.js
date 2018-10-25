    $(document).mouseup(function(e){ 
      var _con = $('.ztree-warp .page-content-wrap');   // 设置目标区域
      if(!_con.is(e.target) && _con.has(e.target).length === 0){ // Mark 1
            $('.ztree-warp .page-content-wrap').hide();
      }
    }) 
    $(document).mouseup(function(e){ 
      var _con = $('.ztree-warp .content');   // 设置目标区域
      if(!_con.is(e.target) && _con.has(e.target).length === 0){ // Mark 1
            $('.ztree-warp .content').hide();
      }
    }) 
    //隐藏所有节点
    function emptyNodes(treeObj) {
        //var zTree = $.fn.zTree.getZTreeObj("tree-dropdownlist");
        var node =  treeObj.getNodesByFilter(function(node){
            return node;
        })
        //隐藏所有节点
        treeObj.hideNodes(node);
    }
    // 查找父级节点  
    function findParent(treeNode, searchArr) {
        // 递归显示父级节点
        var pNode = treeNode.getParentNode();  
        if(pNode != null){  
            searchArr.push(pNode);  
            findParent(pNode, searchArr);  
        } 
    }
    //展示节点
    function showNodes(mulTreeObj,node) {
        //var zTree = $.fn.zTree.getZTreeObj("tree-dropdownlist");
        if (node.length>0) {
            //展开查询到的节点的子节点
            mulTreeObj.expandNode(node[0], true);
        }
        // 数组去重
        var hash = {};
        node = node.reduce(function (item, next) {
            hash[next.name] ? '' : hash[next.name] = true && item.push(next);
            return item
        }, []);

        mulTreeObj.showNodes(node);
    }
    //翻页
    function getPageList (pageData,total,pagesize){
        var pageDataList = [];
        var totalPageNo = parseInt(total/pagesize)+(total%pagesize==0?0:1)
        for (var i = 0; i < totalPageNo; i++) {
            var temp = [];
            for(var j = pagesize*i ; j < pagesize*(i+1)&&j<=total-1; j++){
                temp.push(pageData[j]);
            }
            pageDataList.push(temp);
        }
        return pageDataList;
    }
    //改变节点名称changeName (treeId,treeNode,dataKeys)
    /**var dataKeys = [{"treeId": Primary,
     *           "dataKey":{
     *               name : "name", 
     *               children: "categories"
     *           }
     *           }];
     *将结构返回的不规则名称统一转换成name，value，方便下面操作
     */
    function changeName (treeId,treeNode,dataKeys){ 
        var treeNodeData;
        $.map(dataKeys,function(value,key){   
            //查找到匹配的data格式
            if(value && treeId == value.treeId){  
                if(!isArrayFn(treeNode)){
                    treeNodeData = {};
                    //数组
                    $.map(treeNode,function(v,k){
                        if(k==value.dataKey.name){
                            treeNodeData.name = v;
                        }
                        if(k==value.dataKey.value){
                            treeNodeData.value = v;
                        }  
                    })  
                }else{
                    treeNodeData = [];
                    var temp = {};
                    //树状结构
                    if(value && treeId == value.treeId){
                        $.map(treeNode,function(v,k){ 
                            $.map(v,function(n,i){ 
                                if(i==value.dataKey.name){
                                    temp.name = n;
                                }
                                if(i==value.dataKey.value){
                                    temp.value = n;
                                }   
                            })
                            treeNodeData.push(temp);
                        }) 
                    }  
                }
            } 
            return false;
        })  
        return $.isEmptyObject(treeNodeData)?treeNode:treeNodeData;
    }
    //判断是否是数组
    function isArrayFn(value){
        if (typeof Array.isArray === "function") {
            return Array.isArray(value);
        }else{
            return Object.prototype.toString.call(value) === "[object Array]";
        }
    }