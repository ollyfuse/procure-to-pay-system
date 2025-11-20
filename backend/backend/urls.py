from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.requests.urls')),
    path('api/', include('apps.po.urls')),
    # approvals URLs included in requests for now
]
