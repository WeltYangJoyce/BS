# backend/utils/gps_helper.py
from geopy.geocoders import Nominatim
_geolocator = Nominatim(user_agent="image_gallery_app")

def reverse_geocode(lat: float, lon: float):
    """
    GPS -> 地点信息（城市 / 国家）
    """
    try:
        location = _geolocator.reverse((lat, lon), language="en")
        if not location:
            return None

        address = location.raw.get("address", {})

        city = (
            address.get("city")
            or address.get("town")
            or address.get("village")
        )
        country = address.get("country")

        return {
            "city": city,
            "country": country
        }

    except Exception as e:
        print("Reverse geocode failed:", e)
        return None
