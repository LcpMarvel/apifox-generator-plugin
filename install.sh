#!/bin/bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo ""
echo "================================================"
echo "  Apifox Generator Plugin - 安装脚本"
echo "================================================"
echo ""

# 检查依赖
print_info "检查系统依赖..."

if ! command_exists node; then
    print_error "Node.js 未安装。请先安装 Node.js >= 18"
    echo "  访问: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 版本过低 (当前: v$NODE_VERSION)，需要 >= 18"
    exit 1
fi

print_success "Node.js $(node -v) ✓"

if ! command_exists npm; then
    print_error "npm 未安装"
    exit 1
fi

print_success "npm $(npm -v) ✓"

if ! command_exists docker; then
    print_warning "Docker 未安装或未运行（生成代码时需要）"
    echo "  安装 Docker: https://www.docker.com/get-started"
else
    print_success "Docker ✓"
fi

# 获取当前脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLUGIN_NAME="apifox-generator"
MARKETPLACE_DIR="$HOME/claude-plugins"
PLUGIN_LINK="$MARKETPLACE_DIR/$PLUGIN_NAME"

echo ""
print_info "插件目录: $SCRIPT_DIR"
print_info "Marketplace 目录: $MARKETPLACE_DIR"
echo ""

# 安装依赖并构建
print_info "安装依赖..."
cd "$SCRIPT_DIR"
npm install

print_info "构建插件..."
npm run build

# 验证构建产物
if [ ! -f "skills/apifox-core/dist/index.js" ]; then
    print_error "构建失败: 未找到 skills/apifox-core/dist/index.js"
    exit 1
fi

print_success "构建完成"

# 创建 marketplace 目录
echo ""
print_info "设置本地 Marketplace..."

mkdir -p "$MARKETPLACE_DIR/.claude-plugin"

# 创建或更新符号链接
if [ -L "$PLUGIN_LINK" ] || [ -e "$PLUGIN_LINK" ]; then
    print_warning "插件链接已存在，将重新创建..."
    rm -f "$PLUGIN_LINK"
fi

ln -s "$SCRIPT_DIR" "$PLUGIN_LINK"
print_success "创建插件符号链接"

# 创建 marketplace.json
MARKETPLACE_JSON="$MARKETPLACE_DIR/.claude-plugin/marketplace.json"

cat > "$MARKETPLACE_JSON" << EOF
{
  "name": "local-plugins",
  "owner": {
    "name": "Local Development"
  },
  "plugins": [
    {
      "name": "$PLUGIN_NAME",
      "source": "./$PLUGIN_NAME",
      "description": "从 Apifox 生成 API 客户端代码"
    }
  ]
}
EOF

print_success "创建 Marketplace 配置"

# 显示目录结构
echo ""
print_info "Marketplace 结构:"
echo "  $MARKETPLACE_DIR/"
echo "  ├── .claude-plugin/"
echo "  │   └── marketplace.json"
echo "  └── $PLUGIN_NAME/ -> $SCRIPT_DIR"

# 完成
echo ""
echo "================================================"
print_success "插件安装准备完成！"
echo "================================================"
echo ""
echo "下一步操作："
echo ""
echo "1. 启动 Claude Code:"
echo "   ${BLUE}claude${NC}"
echo ""
echo "2. 添加本地 marketplace:"
echo "   ${BLUE}/plugin marketplace add ~/claude-plugins${NC}"
echo ""
echo "3. 安装插件:"
echo "   ${BLUE}/plugin install apifox-generator@local-plugins${NC}"
echo ""
echo "4. 重启 Claude Code 并验证:"
echo "   ${BLUE}/help${NC}  # 查看 apifox 相关命令"
echo "   ${BLUE}/apifox-init${NC}  # 测试初始化命令"
echo ""
echo "需要帮助？运行: ${BLUE}/apifox-setup${NC}"
echo ""
