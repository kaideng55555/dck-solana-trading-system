from .watch_all_coins import get_internal_stats
def stats_summary_payload():
    return get_internal_stats()
