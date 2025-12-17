-- Function to increment user analytics (for cost tracking)
CREATE OR REPLACE FUNCTION increment_user_analytics(
  p_user_id UUID,
  p_cost_usd DECIMAL
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_analytics (user_id, total_analyses, total_cost_usd, last_analysis_at)
  VALUES (p_user_id, 1, p_cost_usd, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_analyses = user_analytics.total_analyses + 1,
    total_cost_usd = user_analytics.total_cost_usd + p_cost_usd,
    last_analysis_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
