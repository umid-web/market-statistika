import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
import glob

# Page Config
st.set_page_config(
    page_title="Professional Big Data Analytics",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for Premium Design
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
        background-color: #0a0e17;
        color: #e0e0e0;
    }
    
    .main {
        background: radial-gradient(circle at top right, #1a2a4a 0%, #0a0e17 100%);
    }
    
    /* Glassmorphism Card */
    .stMetric {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 20px !important;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        transition: transform 0.3s ease;
    }
    .stMetric:hover {
        transform: translateY(-5px);
        border: 1px solid rgba(212, 175, 55, 0.5);
    }
    
    /* Custom Headers */
    h1 {
        color: #d4af37;
        font-weight: 700 !important;
        letter-spacing: -1px;
        text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
    }
    
    h2, h3 {
        color: #00f2ff;
        font-weight: 600 !important;
    }
    
    /* Plotly Chart Styling */
    .js-plotly-plot {
        background: rgba(0, 0, 0, 0) !important;
        border-radius: 15px;
    }
    
    /* Sidebar */
    .css-1639196 {
        background-color: #0d1420;
    }
    
    .stButton>button {
        background: linear-gradient(135deg, #d4af37 0%, #aa8a2e 100%);
        color: #0a0e17;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        padding: 10px 25px;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
        transform: scale(1.02);
    }
    </style>
    """, unsafe_allow_html=True)

def load_data():
    output_path = Path("data/output_analytics")
    
    if not output_path.exists():
        return None
    
    try:
        # Reading the directory directly handles Spark partitions (e.g. order_month=YYYY-MM)
        df = pd.read_parquet(output_path)
        
        if df.empty:
            return None
            
        # Sort by month
        df = df.sort_values("order_month")
        return df
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return None

def main():
    # Header Area
    col_h1, col_h2 = st.columns([2, 1])
    with col_h1:
        st.title("Big Data Analytics Dashboard")
        st.markdown("*Advanced Hadoop + Spark Pipeline Insights*")
    
    with col_h2:
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("🔄 Refresh Data"):
            st.rerun()

    df = load_data()
    
    if df is None or df.empty:
        st.warning("No data found. Please run the Spark Job first.")
        return

    # Filter Sidebar (Optional)
    st.sidebar.header("Navigation")
    months = sorted(df['order_month'].unique())
    selected_month = st.sidebar.selectbox("Select Month", ["All Time"] + months)
    
    filtered_df = df if selected_month == "All Time" else df[df['order_month'] == selected_month]

    # --- Metrics Row ---
    st.markdown("### Key Performance Indicators")
    m1, m2, m3, m4 = st.columns(4)
    
    total_rev = filtered_df['total_revenue'].sum()
    total_orders = filtered_df['orders'].sum()
    total_cust = filtered_df['unique_customers'].sum()
    avg_rev = filtered_df['avg_order_revenue'].mean()

    m1.metric("Total Revenue", f"${total_rev:,.2f}")
    m2.metric("Total Orders", f"{total_orders:,}")
    m3.metric("Unique Customers", f"{total_cust:,}")
    m4.metric("Avg Order Value", f"${avg_rev:,.2f}")

    # --- Charts Row 1 ---
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)

    with c1:
        st.markdown("### 📈 Revenue Trend Over Time")
        trend_df = df.groupby("order_month")["total_revenue"].sum().reset_index()
        fig_trend = px.line(
            trend_df, x="order_month", y="total_revenue",
            markers=True, line_shape="spline",
            color_discrete_sequence=["#d4af37"]
        )
        fig_trend.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font_color='#e0e0e0',
            xaxis_title="",
            yaxis_title="Revenue ($)"
        )
        st.plotly_chart(fig_trend, use_container_width=True)

    with c2:
        st.markdown("### 🌍 Top Countries by Revenue")
        country_df = filtered_df.groupby("country")["total_revenue"].sum().sort_values(ascending=False).head(10).reset_index()
        fig_country = px.bar(
            country_df, x="total_revenue", y="country",
            orientation='h',
            color="total_revenue",
            color_continuous_scale="Viridis"
        )
        fig_country.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font_color='#e0e0e0',
            xaxis_title="Total Revenue ($)",
            yaxis_title=""
        )
        st.plotly_chart(fig_country, use_container_width=True)

    # --- Charts Row 2 ---
    st.markdown("<br>", unsafe_allow_html=True)
    c3, c4 = st.columns([1, 2])

    with c3:
        st.markdown("### 🥇 Ranking Distribution")
        fig_pie = px.pie(
            filtered_df, names="revenue_rank_in_month", values="total_revenue",
            hole=0.4,
            color_discrete_sequence=["#d4af37", "#aa8a2e", "#8a6d1f", "#5c4813"]
        )
        fig_pie.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font_color='#e0e0e0',
            showlegend=False
        )
        st.plotly_chart(fig_pie, use_container_width=True)

    with c4:
        st.markdown("### 📄 Raw Analytics Data")
        st.dataframe(
            filtered_df.style.background_gradient(cmap="YlOrBr", subset=["total_revenue"]),
            use_container_width=True
        )

    # Footer
    st.markdown("---")
    st.markdown(
        "<div style='text-align: center; color: #666;'>Professional Big Data Solution &copy; 2026 | Powered by Apache Spark</div>", 
        unsafe_allow_html=True
    )

if __name__ == "__main__":
    main()
