from pydantic import BaseModel, Field
from typing import List, Literal, Union

class GeoJSONPoint(BaseModel):
    type: Literal["Point"] = "Point"
    coordinates: List[float] # [longitude, latitude]

class GeoJSONPolygon(BaseModel):
    type: Literal["Polygon"] = "Polygon"
    coordinates: List[List[List[float]]] # [[[lon, lat], [lon, lat], ...]]
