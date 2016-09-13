from pyspatiotemporalgeom import region as region_logic
import copy


def process_polygons(data):
    """
    We now need to structure a data set that pyspatiotemporalgeom can parse.
    This is done by interacting through the coordinates and creating a 2D list.
    Where this list is the coordinates (x, y) of a line. This list is appended
    to another list. This proccess continues util the polygon is complete.
    Argument:
        data, dictionary of JSON data

    Returns:
        an ordered list of half segments with valid labels.
    """
    seg_list = []
    coord_matrix = [[0 for j in range(2)] for i in range(2)]
    for i in range(len(data)):
        coord_matrix[0][0] = data[i].get("lat")
        coord_matrix[0][1] = data[i].get("lng")
        # If not last segment, else complete the shape
        if len(data) > i + 1:
            coord_matrix[1][0] = data[i + 1].get("lat")
            coord_matrix[1][1] = data[i + 1].get("lng")
        else:
            coord_matrix[1][0] = data[0].get("lat")
            coord_matrix[1][1] = data[0].get("lng")
        # Need to make a copy of the list. Else each element in seg_list will
        # be the last coord_matrix data set.
        seg_list.append(copy.deepcopy(coord_matrix))
    return region_logic.createRegionFromSegs(seg_list)


def process_intersections(regions):
    """
    Iterates through each region and gets the next region in the list to check
    for intersections. If there is intersections between the two regions a
    dictionary is created. This dictionary holds the first region's ID and the
    intersection path coordinates.

    Returns:
        A list of intersection dictionaries.
    """
    intersections = []
    for region in regions:
        for other_region in regions:
            if region != other_region:
                intersection = {
                    "region_id": region.get("id"),
                    "other_region": other_region.get("id"),
                    "intersection": region_logic.intersection(
                        region.get("region"), other_region.get("region"))
                }
                intersections.append(intersection)
    return intersections


def process_unions(regions):
    """
    Iterates through each region and gets the next region in the list to check
    for unions. If there is unions between the two regions a
    dictionary is created. This dictionary holds the first region's ID and the
    union path coordinates.

    Returns:
        A list of union dictionaries.
    """
    unions = []
    for region in regions:
        for other_region in regions:
            if region != other_region:
                union = {
                    "region_id": region.get("id"),
                    "other_region": other_region.get("id"),
                    "union": region_logic.union(
                        region.get("region"), other_region.get("region"))
                }
                unions.append(union)
    return unions
