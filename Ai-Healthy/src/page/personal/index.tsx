export default function Personal() {
  return (
    <div id="page-me" className="page-container active">
        <div className="profile-card">
            <div className="avatar-large"></div>
            <h2>张三</h2>
            <p className="profile-subtitle">减脂计划 · 第 12 天</p>
            <div className="stat-row">
                <div className="stat-item">
                    <h3>72.5</h3><span>当前(kg)</span>
                </div>
                <div className="stat-item">
                    <h3>65.0</h3><span>目标(kg)</span>
                </div>
                <div className="stat-item">
                    <h3>12</h3><span>打卡(天)</span>
                </div>
            </div>
        </div>
        <div className="section-title">我的计划</div>
        <div className="settings-list">
            <div className="setting-item">
                <div className="setting-left">
                    <div className="setting-icon">🎯</div> 当前目标
                </div>
                <div className="setting-right setting-primary">每周减 0.5kg</div>
            </div>
            <div className="setting-item">
                <div className="setting-left">
                    <div className="setting-icon">🍽️</div> 饮食模式
                </div>
                <div className="setting-right setting-sub">均衡饮食 (4:3:3)</div>
            </div>
        </div>
        <div className="section-title section-title-space">系统设置</div>
        <div className="settings-list">
            <button type="button" className="setting-item setting-btn">
                <div className="setting-left">
                    <div className="setting-icon">🔔</div> 提醒设置
                </div>
                <div className="setting-chevron">{'>'}</div>
            </button>
            <button type="button" className="setting-item setting-btn">
                <div className="setting-left">
                    <div className="setting-icon">⚙️</div> 账号管理 
                </div>
                <div className="setting-chevron">{'>'}</div>
            </button>
        </div>
    </div>
  )
}
