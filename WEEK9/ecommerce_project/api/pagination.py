"""
pagination.py — Reusable pagination classes.
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    """
    Default pagination: 10 items / page.
    Clients can override via ?page_size=N (max 100).
    """
    page_size              = 10
    page_size_query_param  = 'page_size'
    max_page_size          = 100

    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'total_items': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'current_page': self.page.number,
                'page_size': self.get_page_size(self.request),
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
            },
            'results': data,
        })


class SmallPagination(PageNumberPagination):
    """5 items per page — used for category listings."""
    page_size = 5
