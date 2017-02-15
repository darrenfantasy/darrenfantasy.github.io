---
title: git常用命令行
date: 2016-10-25 15:59:54
tags: [git]
---
### 1.修改.gitignore为全局的方法

直接修改.gitconfig内容，加上
[core]excludesfile = /Users/你的账户文件夹/.gitignore_global

### 2.如何编辑mac系统中的全局gitignore文件？

在根目录下vim .gitignore_global

### 3.配置语法：

以斜杠“/”开头表示目录；

以星号“*”通配多个字符；

以问号“?”通配单个字符；

以方括号“[]”包含单个字符的匹配列表；

以叹号“!”表示不忽略(跟踪)匹配到的文件或目录；

此外，git 对于 .ignore 配置文件是按行从上到下进行规则匹配的，意味着如果前面的规则匹配的范围更大，则后面的规则将不会生效。


---
最常用的

之前一直使用sourcetree来提交代码，现在准备改用命令行来提交。

按照之前sourcetree的逻辑，推送代码前先提交代码到本地git仓库，然后拉取代码，再合并代码。最后推送到远程服务器上。

添加代码对应git add

提交代码对应git commit -m '提交说明'

拉取代码对应git pull

推送代码对应git push

查看当前未提交代码  git status

---
补充

---
初始化配置

<pre><code>
#配置使用git仓库的人员姓名  
git config --global user.name "Your Name Comes Here"  
  
#配置使用git仓库的人员email  
git config --global user.email you@yourdomain.example.com  
</code></pre>


---
取得Git仓库

<pre><code>
#初始化一个版本仓库  
git init  
  
#Clone远程版本库  
git clone git@github.com:darrenfantasy/darrenfantasy.github.io.git 
  
#添加远程版本库origin，语法为 git remote add [shortname] [url]  
git remote add origin git@github.com:darrenfantasy/darrenfantasy.github.io.git  
  
#查看远程仓库  
git remote -v  
</code></pre>

---
提交你的修改

<pre><code>
#添加当前修改的文件到暂存区  
git add .  
  
#如果你自动追踪文件，包括你已经手动删除的，状态为Deleted的文件  
git add -u  
  
#提交你的修改  
git commit –m "你的注释"  
  
#推送你的更新到远程服务器,语法为 git push [远程名] [本地分支]:[远程分支]  
git push origin master  
  
#查看文件状态  
git status  
  
#跟踪新文件  
git add readme.txt  
  
#从当前跟踪列表移除文件，并完全删除  
git rm readme.txt  
  
#仅在暂存区删除，保留文件在当前目录，不再跟踪  
git rm –cached readme.txt  
  
#重命名文件  
git mv reademe.txt readme  
  
#查看提交的历史记录  
git log  
  
#修改最后一次提交注释的，利用–amend参数  
git commit --amend  
  
#忘记提交某些修改，下面的三条命令只会得到一个提交。  
git commit –m &quot;add readme.txt&quot;  
git add readme_forgotten  
git commit –amend  
  
#假设你已经使用git add .，将修改过的文件a、b加到暂存区  
  
#现在你只想提交a文件，不想提交b文件，应该这样  
git reset HEAD b  
  
#取消对文件的修改  
git checkout –- readme.txt  
</code></pre>
---
查看、添加、提交、删除、找回，重置修改文件

<pre><code>
git help <command>  # 显示command的help  
git show            # 显示某次提交的内容  

git add <file>      # 将工作文件修改提交到本地暂存区  
git add .           # 将所有修改过的工作文件提交暂存区  
   
git rm <file>       # 从版本库中删除文件  
git rm <file> --cached  # 从版本库中删除文件，但不删除文件  
   
git reset <file>    # 从暂存区恢复到工作文件  
git reset -- .      # 从暂存区恢复到工作文件  
git reset --hard    # 恢复最近一次提交过的状态，即放弃上次提交后的所有本次修改  

git revert <$id>    # 恢复某次提交的状态，恢复动作本身也创建了一次提交对象  
git revert HEAD     # 恢复最后一次提交的状态  

</code></pre>

---
查看文件diff

<pre><code>
git diff <file>     # 比较当前文件和暂存区文件差异  
git diff  
git diff <$id1> <$id2>   # 比较两次提交之间的差异  
git diff <branch1>..<branch2> # 在两个分支之间比较  
git diff --staged   # 比较暂存区和版本库差异  
git diff --cached   # 比较暂存区和版本库差异  
git diff --stat     # 仅仅比较统计信息  
</code></pre>

---
查看提交记录

<pre><code>
git log  
git log <file>      # 查看该文件每次提交记录  
git log -p <file>   # 查看每次详细修改内容的diff  
git log -p -2       # 查看最近两次详细修改内容的diff  
git log --stat      #查看提交统计信息  
</code></pre>


---
查看、切换、创建和删除分支

<pre><code>
git br -r           # 查看远程分支  
git br <new_branch> # 创建新的分支  
git br -v           # 查看各个分支最后提交信息  
git br --merged     # 查看已经被合并到当前分支的分支  
git br --no-merged  # 查看尚未被合并到当前分支的分支  
   
git co <branch>     # 切换到某个分支  
git co -b <new_branch> # 创建新的分支，并且切换过去  
git co -b <new_branch> <branch>  # 基于branch创建新的new_branch  
   
git co $id          # 把某次历史提交记录checkout出来，但无分支信息，切换到其他分支会自动删除  
git co $id -b <new_branch>  # 把某次历史提交记录checkout出来，创建成一个分支  
   
git br -d <branch>  # 删除某个分支  
git br -D <branch>  # 强制删除某个分支 (未被合并的分支被删除的时候需要强制)  
</code></pre>

---
Git远程分支管理

<pre><code>
git pull                         # 抓取远程仓库所有分支更新并合并到本地  
git pull --no-ff                 # 抓取远程仓库所有分支更新并合并到本地，不要快进合并  
git fetch origin                 # 抓取远程仓库更新  
git merge origin/master          # 将远程主分支合并到本地当前分支  
git co --track origin/branch     # 跟踪某个远程分支创建相应的本地分支  
git co -b <local_branch> origin/<remote_branch>  # 基于远程分支创建本地分支，功能同上  
   
git push                         # push所有分支  
git push origin master           # 将本地主分支推到远程主分支  
git push -u origin master        # 将本地主分支推到远程(如无远程主分支则创建，用于初始化远程仓库)  
git push origin <local_branch>   # 创建远程分支， origin是远程仓库名  
git push origin <local_branch>:<remote_branch>  # 创建远程分支  
git push origin :<remote_branch>  #先删除本地分支(git br -d <branch>)，然后再push删除远程分支  
</code></pre>
