$(function() {
	// 回顶部
	$(window).scroll( function() { 
		if($(this).scrollTop() >= 100 ){
			$("#scrollTop").show();
		} else {
			$("#scrollTop").hide();
		}
	} );
	
	if($(window).scrollTop() >= 100 ){
		$("#scrollTop").show();
	} else {
		$("#scrollTop").hide();
	}
	
	$("#scrollTop").click(function(){$(window).scrollTop(0);return false;});
	
	
	// 回车绑定查询按钮
	$('[name="search_header"]').on('keydown', function (e) {
        var key = e.which;
        if (key == 13 ) {
            e.preventDefault();
            search_form.action = jflyfox.BASE_PATH + "front/tags/"+ $('[name="search_header"]').val();
    		search_form.submit();
        }
    });
	
	$('#search_btn').on('click', function (e) {
		search_form.action = jflyfox.BASE_PATH + "front/tags/"+ $('[name="search_header"]').val();
		search_form.submit();
    });
	
	
	// 评论数获取
	comment.count();
});

/**
 * 评论
 */
comment = {
	/**
	 * 删除评论
	 * 
	 * @param comment_id
	 */
	oper_del:function(comment_id,article_id){
		if(window.confirm('你确定要删除该评论吗？')){
			jQuery.ajax({
				type:'POST',
				url:jflyfox.BASE_PATH + 'front/comment/del',
				data:"model.id=" + comment_id + "&model.article_id=" + article_id,
				success:function(data){
					if(data.status==1){
						$('#comment_'+comment_id+'_'+article_id).remove();
						
						var count = parseInt($('[name="count_comment"]').val());
						$('[name="count_comment"]').val(count - 1);
						$('#count_comment_show').html("评论(" + (count - 1) + ")");
					} else {
						alert('删除失败：'+data.msg);
					}
					$('[name="comment"]').val('');
				},
				error:function(html){
					var flag = (typeof console != 'undefined');
					if(flag) console.log("服务器忙，提交数据失败，代码:" +html.status+ "，请联系管理员！");
					alert("服务器忙，提交数据失败，请联系管理员！");
				}
			});
		}
	}
	/**
	 * 保存评论: 内容 文章id 回复人id 文章创建人id 文章题目
	 */
	,oper_save:function(comment_content,article_id,reply_userid,create_id , article_title){
		article_title = article_title || '';
		var urlParams = "model.content=" + comment_content + "&model.article_id=" + article_id 
			+ "&model.reply_userid=" + reply_userid+ "&model.create_id=" + create_id;
		
		jQuery.ajax({
			type:'POST',
			url:jflyfox.BASE_PATH + 'front/comment/save',
			data:urlParams,
			success:function(data){
			if(data.status==1){
				var createTime = data.create_time;
				var comment_id = data.comment_id;
				var title_url = data.title_url||'';
				var username = data.create_name;
				var reply_username = data.reply_username; 
				title_url = (title_url=='')?(jflyfox.BASE_PATH + 'static/images/user/user.png'):title_url;
				
				var htmlText = '<div class="comment-item" id=comment_'+ comment_id + '_' + article_id + '>';
				htmlText += '<div class="item-top">';
				htmlText += '<a href="#"><img alt="" width="32" height="32" alt="头像" class="img_radius" src="'+title_url+'" /></a>';
				
				if(article_title != ''){
					htmlText += '<a href="front/article/'+ article_id +'#article_comment" target="_blank" class="user-name">'+article_title+'</a>';
					htmlText += '<span class="comment-txt">文章中</span>';
				}
				
				htmlText += '<a href="#" class="user-name">'+username+'</a>';
				// 回复
				if(reply_userid > 0 ) { 
					htmlText += '<span style="float: left;margin-right: 10px;">回复</span>';
					htmlText += '<a href="#" class="user-name">' + reply_username + '</a>';
					htmlText += '<br>';
				}
				
				htmlText += '<div style="float:none;line-height: 24px;overflow: visible;">';
				htmlText += '<span>'+comment_content+'</span>';
				htmlText += '</div></div>';
				htmlText += '<div class="item-bottom">';
				htmlText += '<span>'+createTime+'</span>';
				htmlText += '<a href="javascript:comment.oper_del(' + comment_id + ',' + article_id +');" style="float: right;">删除</a>';
				htmlText += '</div></div>';		
				$('.comment-list').prepend(htmlText);
				
				var count = parseInt($('[name="count_comment"]').val());
				$('[name="count_comment"]').val(count + 1);
				$('#count_comment_show').html("评论(" + (count + 1) + ")");
				
			} else {
				alert('保存失败：'+data.msg);
			}
			$('[name="comment"]').val('');
			},
			error:function(html){
			var flag = (typeof console != 'undefined');
			if(flag) console.log("服务器忙，提交数据失败，代码:" +html.status+ "，请联系管理员！");
			alert("服务器忙，提交数据失败，请联系管理员！");
			}
		});
		
	}
	,count:function(){
		if ($("#mymessage").length <= 0){  
			return;
		}
		
		jQuery.ajax({
			type:'POST',
			url:jflyfox.BASE_PATH + 'front/comment/count',
			success:function(data){
				if(data.status==1){
					if(data.count > 0 ){
						$('#mymessage').hide();
						$('#mymessage').html('我的消息（'+data.count+'）');
						$('#mymessage').css('font-weight','bold');
						$('#mymessage').css('color','green');
						$('#mymessage').show(500);
					} else {
						// 如果已经读过，那么恢复初始化
						if($('#mymessage').text() != '我的消息') {
							$('#mymessage').text('我的消息');
							$('#mymessage').css('font-weight','');
							$('#mymessage').css('color','#454545');							
						}
					}
				} else {
					console_log('获取评论失败：'+data.msg);
				}
			},
			error:function(html){
				var flag = (typeof console != 'undefined');
				if(flag) console.log("服务器忙，提交数据失败，代码:" +html.status+ "，请联系管理员！");
				// alert("服务器忙，提交数据失败，请联系管理员！");
			}
		});
		// 压力太大了就改大点
		window.setTimeout('comment.count()',600*1000);
	}
	
};


/**
 * 文章喜欢
 */
articlelike = {
	click:function(article_id){
		if($('#articlelike_'+article_id).hasClass('glyphicon-heart-empty')){
			articlelike.yes(article_id);
		} else {
			articlelike.no(article_id);
		}
	}
	/**
	 * 喜欢
	 * 
	 * @param article_id
	 */
	,yes:function(article_id){
		jQuery.ajax({
			type:'POST',
			url:jflyfox.BASE_PATH + 'front/articlelike/yes/'+article_id,
			success:function(data){
				if(data.status==1){
					$('#articlelike_'+article_id).removeClass('glyphicon-heart-empty').addClass('glyphicon-heart');
					$('#articlelike_'+article_id).attr("title","取消喜欢");
				} else {
					alert('失败：'+data.msg);
				}
			},
			error:function(html){
				var flag = (typeof console != 'undefined');
				if(flag) console.log("服务器忙，提交数据失败，代码:" +html.status+ "，请联系管理员！");
				alert("服务器忙，提交数据失败，请联系管理员！");
			}
		});
	}

	/**
	 * 取消喜欢
	 * 
	 * @param article_id
	 */
	,no:function(article_id){
		jQuery.ajax({
			type:'POST',
			url:jflyfox.BASE_PATH + 'front/articlelike/no/'+article_id,
			success:function(data){
				if(data.status==1){
					$('#articlelike_'+article_id).removeClass('glyphicon-heart').addClass('glyphicon-heart-empty');
					$('#articlelike_'+article_id).attr("title","喜欢");
				} else {
					alert('失败：'+data.msg);
				}
			},
			error:function(html){
				var flag = (typeof console != 'undefined');
				if(flag) console.log("服务器忙，提交数据失败，代码:" +html.status+ "，请联系管理员！");
				alert("服务器忙，提交数据失败，请联系管理员！");
			}
		});
	}
	
	
};


