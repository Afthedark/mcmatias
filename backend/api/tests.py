from datetime import date, timedelta
from unittest import mock

from django.conf import settings
from django.test import SimpleTestCase
from django.utils import timezone

from .views_reports import ReporteBaseView


class _DummyRequest:
    query_params = {}


class TimezoneBoliviaTests(SimpleTestCase):
    def test_settings_timezone_is_bolivia(self):
        self.assertEqual(settings.TIME_ZONE, "America/La_Paz")

    def test_localtime_offset_is_minus_4(self):
        offset = timezone.localtime(timezone.now()).utcoffset()
        self.assertEqual(offset, timedelta(hours=-4))

    @mock.patch("api.views_reports.timezone.localdate")
    def test_reportes_default_hoy_usa_localdate(self, localdate_mock):
        localdate_mock.return_value = date(2026, 1, 27)
        fecha_desde, fecha_hasta = ReporteBaseView().get_fechas_filtro(_DummyRequest())
        self.assertTrue(timezone.is_aware(fecha_desde))
        self.assertTrue(timezone.is_aware(fecha_hasta))
        self.assertEqual(fecha_desde.date(), date(2026, 1, 27))
        self.assertEqual(fecha_hasta.date(), date(2026, 1, 27))
